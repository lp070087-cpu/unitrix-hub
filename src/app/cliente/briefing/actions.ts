"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { notifyAdmin } from "@/lib/server/notify";
import { BRIEFING_EDITABLE, briefingSaveSchema, submissionErrors, type BriefingSaveInput } from "@/lib/briefing/schema";

const id = z.string().min(1).max(64);

const createSchema = z.object({
  title: z.string().trim().min(3, "Informe um título").max(160),
  projectId: z.string().optional().transform((v) => v || null),
});

function revalidate(bid?: string) {
  revalidatePath("/cliente/briefing");
  revalidatePath("/admin/briefings");
  if (bid) {
    revalidatePath(`/cliente/briefing/${bid}`);
    revalidatePath(`/admin/briefings/${bid}`);
  }
}

export async function createClientBriefing(input: z.input<typeof createSchema>) {
  return safe(async () => {
    const { clientId, client } = await requireClient();
    const data = createSchema.parse(input);
    if (data.projectId) {
      const project = await prisma.project.findFirst({ where: { id: data.projectId, clientId, briefing: null }, select: { id: true } });
      if (!project) throw new UserError("Projeto inválido ou já possui briefing");
    }
    const b = await prisma.briefing.create({
      data: { title: data.title, status: "DRAFT", clientId, projectId: data.projectId, companyName: client.company ?? null },
      select: { id: true },
    });
    revalidate(b.id);
    return { id: b.id };
  }, "Briefing criado");
}

async function persist(briefingId: string, clientId: string, input: BriefingSaveInput) {
  const data = briefingSaveSchema.parse(input);
  const current = await prisma.briefing.findFirst({ where: { id: briefingId, clientId }, select: { id: true, status: true } });
  if (!current) throw new UserError("Briefing não encontrado");
  if (!BRIEFING_EDITABLE.includes(current.status)) throw new UserError("Este briefing já foi enviado e não pode ser editado");
  await prisma.$transaction(async (tx) => {
    const res = await tx.briefing.updateMany({
      where: { id: briefingId, clientId, status: { in: BRIEFING_EDITABLE } },
      data: { title: data.title, ...data.fields },
    });
    if (res.count === 0) throw new UserError("Este briefing não está mais editável");
    await tx.briefingFile.deleteMany({ where: { briefingId } });
    if (data.files.length) {
      await tx.briefingFile.createMany({ data: data.files.map((f) => ({ briefingId, kind: f.kind, label: f.label, externalUrl: f.externalUrl })) });
    }
  });
  return data;
}

export async function saveBriefingDraft(briefingId: string, input: BriefingSaveInput) {
  return safe(async () => {
    const { clientId } = await requireClient();
    const bid = id.parse(briefingId);
    await persist(bid, clientId, input);
    revalidate(bid);
    return { id: bid };
  }, "Rascunho salvo");
}

export async function submitBriefing(briefingId: string, input: BriefingSaveInput) {
  return safe(async () => {
    const { clientId, client } = await requireClient();
    const bid = id.parse(briefingId);
    const data = await persist(bid, clientId, input);
    const missing = submissionErrors(data.fields);
    if (missing.length) throw new UserError(`Preencha antes de enviar: ${missing.join(", ")}. Seu rascunho foi salvo.`);
    const res = await prisma.briefing.updateMany({
      where: { id: bid, clientId, status: { in: BRIEFING_EDITABLE } },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
    if (res.count === 0) throw new UserError("Este briefing não está mais editável");
    await notifyAdmin("Briefing enviado para análise", `${client.name} enviou o briefing "${data.title}".`, { type: "BRIEFING", link: `/admin/briefings/${bid}`, clientId });
    revalidate(bid);
    return { id: bid };
  }, "Briefing enviado para análise");
}
