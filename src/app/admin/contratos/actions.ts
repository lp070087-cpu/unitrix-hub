"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { getRequestMeta } from "@/lib/server/request";
import { notifyClient } from "@/lib/server/notify";
import { renderContract } from "@/lib/contracts/master";
import { unguessableSlug } from "@/lib/contracts/slug";

const optionalText = (max: number) =>
  z.string().trim().max(max, "Texto muito longo").optional().transform((v) => (v ? v : null));
/** "YYYY-MM-DD" → meio-dia UTC (evita a data "voltar um dia" ao exibir em America/Sao_Paulo). */
function parseDay(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00Z`) : new Date(v);
}
const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? parseDay(v) : null))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), "Data inválida");

const contractSchema = z.object({
  clientId: z.string().min(1, "Selecione o cliente"),
  projectId: z.string().optional().transform((v) => v || null),
  title: z.string().trim().min(3, "Informe um título").max(160),
  scope: z.string().trim().min(10, "Descreva o escopo (mínimo 10 caracteres)").max(20000),
  value: z.coerce.number({ invalid_type_error: "Valor inválido" }).positive("Informe um valor maior que zero").max(99_999_999),
  deadline: z.string().min(1, "Informe o prazo").transform(parseDay).refine((d) => !Number.isNaN(d.getTime()), "Prazo inválido"),
  startDate: optionalDate,
  endDate: optionalDate,
  deliveryPeriod: optionalText(300),
  conditions: optionalText(10000),
  projectType: optionalText(120),
});

export type ContractInput = Omit<z.input<typeof contractSchema>, "value"> & { value: string | number };

const idSchema = z.string().min(1).max(64);

async function loadParties(clientId: string, projectId: string | null) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, document: true, company: true, email: true, address: true, city: true, projectType: true },
  });
  if (!client) throw new UserError("Cliente não encontrado");
  let project: { id: string; title: string } | null = null;
  if (projectId) {
    project = await prisma.project.findFirst({ where: { id: projectId, clientId }, select: { id: true, title: true } });
    if (!project) throw new UserError("Projeto não pertence a este cliente");
  }
  return { client, project };
}

function snapshotFor(
  data: z.output<typeof contractSchema>,
  version: number,
  parties: Awaited<ReturnType<typeof loadParties>>
) {
  return renderContract({
    title: data.title,
    version,
    client: parties.client,
    project: parties.project,
    projectType: data.projectType ?? parties.client.projectType,
    scope: data.scope,
    value: data.value,
    deadline: data.deadline,
    startDate: data.startDate,
    endDate: data.endDate,
    deliveryPeriod: data.deliveryPeriod,
    conditions: data.conditions,
  }) as unknown as Prisma.InputJsonValue;
}

function revalidateContract(id?: string, slug?: string) {
  revalidatePath("/admin/contratos");
  revalidatePath("/cliente/contratos");
  if (id) revalidatePath(`/admin/contratos/${id}`);
  if (slug) revalidatePath(`/contrato/${slug}`);
}

export async function createContract(input: ContractInput) {
  return safe(async () => {
    const session = await requireAdmin();
    const data = contractSchema.parse(input);
    const parties = await loadParties(data.clientId, data.projectId);
    const { ip, userAgent } = await getRequestMeta();

    const contract = await prisma.contract.create({
      data: {
        title: data.title,
        slug: unguessableSlug(data.title),
        scope: data.scope,
        value: data.value,
        deadline: data.deadline,
        startDate: data.startDate,
        endDate: data.endDate,
        deliveryPeriod: data.deliveryPeriod,
        conditions: data.conditions,
        projectType: data.projectType ?? parties.client.projectType,
        status: "DRAFT",
        version: 1,
        clientId: parties.client.id,
        clientName: parties.client.name,
        clientDocument: parties.client.document,
        clientCompany: parties.client.company,
        projectId: parties.project?.id ?? null,
        createdById: session.user.id,
        contentSnapshot: snapshotFor(data, 1, parties),
        events: { create: { action: "CREATED", actor: session.user.email ?? "admin", ip, userAgent, details: { version: 1 } } },
      },
      select: { id: true },
    });
    revalidateContract(contract.id);
    return { id: contract.id };
  }, "Contrato criado");
}

export async function updateDraftContract(id: string, input: ContractInput) {
  return safe(async () => {
    const session = await requireAdmin();
    const contractId = idSchema.parse(id);
    const data = contractSchema.parse(input);
    const current = await prisma.contract.findUnique({ where: { id: contractId }, select: { status: true, version: true, slug: true } });
    if (!current) throw new UserError("Contrato não encontrado");
    if (current.status !== "DRAFT") throw new UserError("Apenas contratos em rascunho podem ser editados");
    const parties = await loadParties(data.clientId, data.projectId);
    const { ip, userAgent } = await getRequestMeta();

    const res = await prisma.contract.updateMany({
      where: { id: contractId, status: "DRAFT" },
      data: {
        title: data.title,
        scope: data.scope,
        value: data.value,
        deadline: data.deadline,
        startDate: data.startDate,
        endDate: data.endDate,
        deliveryPeriod: data.deliveryPeriod,
        conditions: data.conditions,
        projectType: data.projectType ?? parties.client.projectType,
        clientId: parties.client.id,
        clientName: parties.client.name,
        clientDocument: parties.client.document,
        clientCompany: parties.client.company,
        projectId: parties.project?.id ?? null,
        contentSnapshot: snapshotFor(data, current.version, parties),
      },
    });
    if (res.count === 0) throw new UserError("O contrato não está mais em rascunho");
    await prisma.contractEvent.create({ data: { contractId, action: "UPDATED", actor: session.user.email ?? "admin", ip, userAgent } });
    revalidateContract(contractId, current.slug);
    return { id: contractId };
  }, "Rascunho atualizado");
}

export async function sendContract(id: string) {
  return safe(async () => {
    const session = await requireAdmin();
    const contractId = idSchema.parse(id);
    const c = await prisma.contract.findUnique({ where: { id: contractId }, select: { id: true, status: true, slug: true, clientId: true, title: true, version: true } });
    if (!c) throw new UserError("Contrato não encontrado");
    if (!["DRAFT", "SENT", "VIEWED"].includes(c.status)) throw new UserError("Este contrato não pode ser enviado no status atual");
    const { ip, userAgent } = await getRequestMeta();
    const first = c.status === "DRAFT";
    if (first) {
      const res = await prisma.contract.updateMany({ where: { id: c.id, status: "DRAFT" }, data: { status: "SENT", sentAt: new Date() } });
      if (res.count === 0) throw new UserError("O status do contrato mudou. Atualize a página.");
    }
    await prisma.contractEvent.create({
      data: { contractId: c.id, action: first ? "SENT" : "RESENT", actor: session.user.email ?? "admin", ip, userAgent, details: { version: c.version } },
    });
    await notifyClient(
      c.clientId,
      first ? "Novo contrato disponível" : "Lembrete: contrato aguardando assinatura",
      `O contrato "${c.title}" (versão ${c.version}) está disponível para leitura e assinatura eletrônica.`,
      { type: "CONTRACT", link: "/cliente/contratos" }
    );
    revalidateContract(c.id, c.slug);
    return { status: first ? "SENT" : c.status };
  }, "Contrato enviado ao cliente");
}

export async function createContractVersion(id: string) {
  return safe(async () => {
    const session = await requireAdmin();
    const contractId = idSchema.parse(id);
    const c = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { nextVersion: { select: { id: true } }, client: { select: { id: true, name: true, document: true, company: true, email: true, address: true, city: true, projectType: true } }, project: { select: { id: true, title: true } } },
    });
    if (!c) throw new UserError("Contrato não encontrado");
    if (c.nextVersion) throw new UserError("Já existe uma versão posterior deste contrato");
    if (!["SENT", "VIEWED", "SIGNED"].includes(c.status)) {
      throw new UserError(c.status === "DRAFT" ? "Rascunhos podem ser editados diretamente" : "Não é possível versionar este contrato");
    }
    const signed = c.status === "SIGNED";
    const version = c.version + 1;
    const { ip, userAgent } = await getRequestMeta();
    const now = new Date();
    const actor = session.user.email ?? "admin";

    const created = await prisma.$transaction(async (tx) => {
      // Marca a versão anterior. Se assinada, preserva o status SIGNED (aditivo) e só registra supersededAt.
      const prev = await tx.contract.updateMany({
        where: { id: c.id, status: c.status, supersededAt: null },
        data: signed ? { supersededAt: now } : { status: "SUPERSEDED", supersededAt: now },
      });
      if (prev.count === 0) throw new UserError("O contrato foi alterado por outra ação. Atualize a página.");
      const next = await tx.contract.create({
        data: {
          title: c.title,
          slug: unguessableSlug(c.title),
          scope: c.scope,
          value: c.value,
          deadline: c.deadline,
          startDate: c.startDate,
          endDate: c.endDate,
          deliveryPeriod: c.deliveryPeriod,
          conditions: c.conditions,
          projectType: c.projectType,
          status: "DRAFT",
          version,
          clientId: c.clientId,
          clientName: c.client.name,
          clientDocument: c.client.document,
          clientCompany: c.client.company,
          projectId: c.projectId,
          createdById: session.user.id,
          previousVersionId: c.id,
          contentSnapshot: renderContract({
            title: c.title,
            version,
            client: c.client,
            project: c.project,
            projectType: c.projectType,
            scope: c.scope,
            value: Number(c.value),
            deadline: c.deadline,
            startDate: c.startDate,
            endDate: c.endDate,
            deliveryPeriod: c.deliveryPeriod,
            conditions: c.conditions,
          }) as unknown as Prisma.InputJsonValue,
          events: { create: { action: "CREATED", actor, ip, userAgent, details: { version, previousVersionId: c.id, amendment: signed } } },
        },
        select: { id: true },
      });
      await tx.contractEvent.create({
        data: { contractId: c.id, action: "VERSIONED", actor, ip, userAgent, details: { newVersionId: next.id, newVersion: version, amendment: signed } },
      });
      return next;
    });
    revalidateContract(c.id, c.slug);
    revalidatePath(`/admin/contratos/${created.id}`);
    return { id: created.id };
  }, "Nova versão criada em rascunho");
}

export async function cancelContract(id: string) {
  return safe(async () => {
    const session = await requireAdmin();
    const contractId = idSchema.parse(id);
    const c = await prisma.contract.findUnique({ where: { id: contractId }, select: { id: true, slug: true, clientId: true, title: true, status: true } });
    if (!c) throw new UserError("Contrato não encontrado");
    const res = await prisma.contract.updateMany({
      where: { id: c.id, signedAt: null, status: { in: ["DRAFT", "SENT", "VIEWED"] } },
      data: { status: "CANCELLED" },
    });
    if (res.count === 0) throw new UserError("Contratos assinados, substituídos ou já cancelados não podem ser cancelados");
    const { ip, userAgent } = await getRequestMeta();
    await prisma.contractEvent.create({ data: { contractId: c.id, action: "CANCELLED", actor: session.user.email ?? "admin", ip, userAgent } });
    if (c.status !== "DRAFT") {
      await notifyClient(c.clientId, "Contrato cancelado", `O contrato "${c.title}" foi cancelado pela Unitrix.`, { type: "CONTRACT", link: "/cliente/contratos" });
    }
    revalidateContract(c.id, c.slug);
    return { id: c.id };
  }, "Contrato cancelado");
}
