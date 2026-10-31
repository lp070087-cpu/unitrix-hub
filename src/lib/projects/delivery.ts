import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserError } from "@/lib/server/action";
import { notifyAdmin, notifyClient } from "@/lib/server/notify";
import { PAYMENT_TYPE_MAP } from "@/lib/utils";

export const REQUIRED_CHARGE_TYPES = ["DEPOSIT", "FINAL_BALANCE"] as const;

export type DeliveryCredential = { label: string; value: string };

export class DeliveryBlockedError extends UserError {
  constructor(message: string, public blockedReason: string) {
    super(message);
  }
}

/**
 * Cobranças que impedem a liberação: DEPOSIT/FINAL_BALANCE ainda não pagas.
 * Cobranças canceladas não contam (foram anuladas pelo admin). Se o projeto tem valor
 * e não há nenhuma cobrança 50/50 válida, a liberação também fica bloqueada.
 */
export async function getDeliveryBlockers(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { totalValue: true, payments: { where: { type: { in: [...REQUIRED_CHARGE_TYPES] } }, select: { id: true, type: true, status: true, amount: true } } },
  });
  if (!project) throw new UserError("Projeto não encontrado");
  const active = project.payments.filter((p) => p.status !== "CANCELLED");
  const unpaid = active.filter((p) => p.status !== "PAID");
  const missingCharges = Number(project.totalValue ?? 0) > 0 && active.length === 0;
  const reasons: string[] = [];
  if (missingCharges) reasons.push("cobranças 50/50 não geradas");
  for (const p of unpaid) reasons.push(`${PAYMENT_TYPE_MAP[p.type] ?? p.type} ${p.status === "OVERDUE" ? "em atraso" : "pendente"}`);
  return { unpaid, missingCharges, releasable: reasons.length === 0, blockedReason: reasons.length ? `Aguardando quitação: ${reasons.join(", ")}` : null };
}

export function parseCredentials(raw: unknown): DeliveryCredential[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is DeliveryCredential => !!c && typeof c === "object" && typeof (c as any).label === "string" && typeof (c as any).value === "string")
    .map((c) => ({ label: c.label, value: c.value }));
}

/** Garante que o projeto tenha um registro de entrega (BLOCKED por padrão). */
export async function ensureDelivery(projectId: string) {
  return prisma.delivery.upsert({ where: { projectId }, update: {}, create: { projectId, status: "BLOCKED", blockedReason: "Liberada após a quitação do saldo" } });
}

/** Atualiza dados da entrega (nunca libera; RELEASED só via releaseDelivery). */
export async function saveDelivery(
  projectId: string,
  data: { status: "BLOCKED" | "READY"; link?: string | null; documentation?: string | null; notes?: string | null; credentials: DeliveryCredential[] }
) {
  const current = await prisma.delivery.findUnique({ where: { projectId } });
  const blockers = await getDeliveryBlockers(projectId);
  // Uma entrega já liberada mantém o status; apenas os dados são atualizados.
  const status = current?.status === "RELEASED" ? "RELEASED" : data.status;
  const payload = {
    status,
    link: data.link || null,
    documentation: data.documentation || null,
    notes: data.notes || null,
    credentials: data.credentials.length ? (data.credentials as Prisma.InputJsonValue) : Prisma.DbNull,
    blockedReason: status === "RELEASED" ? null : blockers.blockedReason,
  };
  const delivery = await prisma.delivery.upsert({ where: { projectId }, update: payload, create: { projectId, ...payload } });
  if (status === "READY" && current?.status !== "READY" && blockers.releasable) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true, clientId: true } });
    if (project) await notifyAdmin("Entrega pronta para liberação", `${project.title}: pagamentos quitados, entrega pronta.`, { type: "PROJECT", link: `/admin/projetos/${projectId}`, clientId: project.clientId });
  }
  return delivery;
}

/** Libera a entrega. Exige DEPOSIT e FINAL_BALANCE pagos. */
export async function releaseDelivery(projectId: string) {
  const blockers = await getDeliveryBlockers(projectId);
  if (!blockers.releasable) {
    await prisma.delivery.updateMany({ where: { projectId, status: { not: "RELEASED" } }, data: { blockedReason: blockers.blockedReason } });
    throw new DeliveryBlockedError(`Entrega bloqueada. ${blockers.blockedReason}.`, blockers.blockedReason!);
  }
  const delivery = await prisma.delivery.findUnique({ where: { projectId } });
  if (!delivery) throw new UserError("Cadastre os dados da entrega antes de liberar");
  if (delivery.status === "RELEASED") return { alreadyReleased: true };
  if (!delivery.link && !delivery.documentation) throw new UserError("Informe o link ou a documentação da entrega antes de liberar");

  const now = new Date();
  const [res, project] = await prisma.$transaction([
    prisma.delivery.updateMany({ where: { projectId, status: { not: "RELEASED" } }, data: { status: "RELEASED", releasedAt: now, blockedReason: null } }),
    prisma.project.update({ where: { id: projectId }, data: { status: "DELIVERED", stageChangedAt: now }, select: { title: true, clientId: true } }),
  ]);
  if (res.count > 0) {
    await notifyClient(project.clientId, "Entrega liberada", `A entrega do projeto ${project.title} está disponível.`, { type: "PROJECT", link: `/cliente/projetos/${projectId}` });
  }
  return { alreadyReleased: res.count === 0 };
}

/**
 * Chamado após confirmar pagamento de projeto. Não libera automaticamente:
 * atualiza o motivo do bloqueio e avisa o admin quando a entrega READY pode ser liberada.
 */
export async function onProjectPaymentConfirmed(projectId: string) {
  const delivery = await prisma.delivery.findUnique({ where: { projectId } });
  if (!delivery || delivery.status === "RELEASED") return;
  const blockers = await getDeliveryBlockers(projectId);
  await prisma.delivery.update({ where: { projectId }, data: { blockedReason: blockers.blockedReason } });
  if (blockers.releasable && delivery.status === "READY") {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true, clientId: true } });
    if (project) {
      await notifyAdmin("Entrega pronta para liberação", `${project.title}: entrada e saldo quitados. A entrega pode ser liberada.`, { type: "PROJECT", link: `/admin/projetos/${projectId}`, clientId: project.clientId });
    }
  }
}
