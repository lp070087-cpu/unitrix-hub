"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { getRequestMeta } from "@/lib/server/request";
import { notifyAdmin, notifyClient } from "@/lib/server/notify";
import { formatCpfCnpj, isValidCpfOrCnpj } from "@/lib/contracts/document-id";
import { computeSignatureHash } from "@/lib/contracts/evidence";
import { summarizeUserAgent } from "@/lib/contracts/ua";

const SIGNABLE = ["SENT", "VIEWED"];
const PNG_PREFIX = "data:image/png;base64,";
const MAX_SIGNATURE_CHARS = 400_000; // ~300 KB de PNG

const slugSchema = z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, "Link inválido");

const signSchema = z.object({
  slug: slugSchema,
  readConfirmed: z.literal(true, { errorMap: () => ({ message: "Confirme que leu integralmente o contrato" }) }),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "É necessário aceitar os termos" }) }),
  signerName: z
    .string()
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().min(5, "Informe o nome completo").max(160).refine((v) => v.split(" ").length >= 2, "Informe nome e sobrenome")),
  signerDocument: z.string().refine(isValidCpfOrCnpj, "CPF ou CNPJ inválido"),
  signatureData: z
    .string()
    .max(MAX_SIGNATURE_CHARS, "Assinatura muito grande. Limpe e desenhe novamente.")
    .refine((v) => v.startsWith(PNG_PREFIX) && /^[A-Za-z0-9+/]+=*$/.test(v.slice(PNG_PREFIX.length)), "Assinatura inválida")
    .refine((v) => {
      const buf = Buffer.from(v.slice(PNG_PREFIX.length), "base64");
      return buf.length > 100 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }, "Assinatura inválida"),
});

export type SignInput = z.input<typeof signSchema>;

async function ownedContract(slug: string, clientId: string) {
  const c = await prisma.contract.findFirst({ where: { slug, clientId } });
  if (!c) throw new UserError("Contrato não encontrado");
  return c;
}

/** Passo 1: registra a confirmação de leitura (horário do servidor). */
export async function confirmContractRead(slug: string) {
  return safe(async () => {
    const { clientId, client } = await requireClient();
    const c = await ownedContract(slugSchema.parse(slug), clientId);
    if (!SIGNABLE.includes(c.status) || c.signedAt) throw new UserError("Este contrato não está disponível para assinatura");
    const res = await prisma.contract.updateMany({
      where: { id: c.id, clientId, readConfirmed: false, signedAt: null, status: { in: SIGNABLE } },
      data: { readConfirmed: true, readConfirmedAt: new Date() },
    });
    if (res.count > 0) {
      const { ip, userAgent } = await getRequestMeta();
      await prisma.contractEvent.create({ data: { contractId: c.id, action: "READ_CONFIRMED", actor: client.email, ip, userAgent } });
    }
    return { ok: true };
  });
}

/** Aceite + assinatura eletrônica. Idempotente e protegido contra dupla assinatura concorrente. */
export async function signContract(input: SignInput) {
  return safe(async () => {
    const { clientId, client } = await requireClient();
    const data = signSchema.parse(input);
    const c = await ownedContract(data.slug, clientId);
    if (c.signedAt || c.status === "SIGNED") throw new UserError("Este contrato já foi assinado.");
    if (!SIGNABLE.includes(c.status)) throw new UserError("Este contrato não está disponível para assinatura.");

    const { ip, userAgent } = await getRequestMeta();
    const signedAt = new Date();
    const signerDocument = formatCpfCnpj(data.signerDocument);
    const signatureHash = computeSignatureHash({
      contractId: c.id,
      version: c.version,
      contentSnapshot: c.contentSnapshot,
      signerName: data.signerName,
      signerDocument,
      signedAt,
      ip,
      userAgent,
      signatureData: data.signatureData,
    });

    const res = await prisma.contract.updateMany({
      where: { id: c.id, clientId, signedAt: null, status: { in: SIGNABLE } },
      data: {
        readConfirmed: true,
        readConfirmedAt: c.readConfirmedAt ?? signedAt,
        termsAccepted: true,
        termsAcceptedAt: signedAt,
        signerName: data.signerName,
        signerDocument,
        signatureData: data.signatureData,
        signatureIp: ip,
        signatureBrowser: summarizeUserAgent(userAgent),
        signatureUserAgent: userAgent,
        signatureHash,
        signedAt,
        status: "SIGNED",
      },
    });
    if (res.count === 0) throw new UserError("Este contrato já foi assinado ou não está mais disponível.");

    await prisma.contractEvent.create({
      data: { contractId: c.id, action: "SIGNED", actor: client.email, ip, userAgent, details: { version: c.version, signatureHash, signerName: data.signerName } },
    });
    await notifyAdmin("Contrato assinado", `${client.name} assinou "${c.title}" (versão ${c.version}).`, { type: "CONTRACT", link: `/admin/contratos/${c.id}`, clientId });
    await notifyClient(clientId, "Contrato assinado", `Sua assinatura do contrato "${c.title}" foi registrada.`, { type: "CONTRACT", link: `/contrato/${c.slug}` });

    revalidatePath(`/contrato/${c.slug}`);
    revalidatePath("/cliente/contratos");
    revalidatePath("/admin/contratos");
    revalidatePath(`/admin/contratos/${c.id}`);
    return { signedAt: signedAt.toISOString(), signatureHash };
  }, "Contrato assinado com sucesso");
}
