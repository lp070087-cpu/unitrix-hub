import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserError } from "@/lib/server/action";
import { notifyClient } from "@/lib/server/notify";
import { formatCurrency } from "@/lib/utils";
import { onProjectPaymentConfirmed } from "@/lib/projects/delivery";
import { onSubscriptionPaymentConfirmed } from "./subscriptions";
import { splitFiftyFifty } from "./money";
import { markOverdue } from "./overdue";

export { markOverdue };

export const PAYMENT_METHODS: Record<string, string> = {
  PIX: "Pix", BOLETO: "Boleto", TRANSFER: "Transferência", CARD: "Cartão", CASH: "Dinheiro", OTHER: "Outro",
};

/**
 * Gera as cobranças 50/50 (entrada + saldo) do projeto. Idempotente pela unique
 * (projectId, chargeKey): chamar novamente não duplica.
 */
export async function ensureProjectCharges(projectId: string, opts: { depositDue?: Date | null; finalDue?: Date | null } = {}) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, title: true, clientId: true, totalValue: true, startDate: true, endDate: true } });
  if (!project) throw new UserError("Projeto não encontrado");
  const total = Number(project.totalValue ?? 0);
  if (!(total >= 0.02)) throw new UserError("Defina o valor total do projeto para gerar as cobranças");
  const { deposit, balance } = splitFiftyFifty(total);
  const res = await prisma.payment.createMany({
    skipDuplicates: true,
    data: [
      {
        description: `Entrada 50% · ${project.title}`, amount: new Prisma.Decimal(deposit.toFixed(2)), type: "DEPOSIT", status: "PENDING",
        chargeKey: "deposit", clientId: project.clientId, projectId: project.id, dueDate: opts.depositDue ?? project.startDate ?? null,
      },
      {
        description: `Saldo 50% · ${project.title}`, amount: new Prisma.Decimal(balance.toFixed(2)), type: "FINAL_BALANCE", status: "PENDING",
        chargeKey: "final", clientId: project.clientId, projectId: project.id, dueDate: opts.finalDue ?? project.endDate ?? null,
      },
    ],
  });
  return { created: res.count };
}

export type ConfirmInput = { method: string; paidAt?: Date | null; notes?: string | null };

/**
 * Confirmação administrativa. Idempotente e à prova de duplo clique: a transição só ocorre
 * a partir de PENDING/OVERDUE; se nada mudou, retorna alreadyConfirmed.
 */
export async function confirmPayment(paymentId: string, input: ConfirmInput, adminEmail: string) {
  const res = await prisma.payment.updateMany({
    where: { id: paymentId, status: { in: ["PENDING", "OVERDUE"] } },
    data: { status: "PAID", paidAt: input.paidAt ?? new Date(), method: input.method, confirmedBy: adminEmail, notes: input.notes || undefined },
  });
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new UserError("Cobrança não encontrada");
  if (res.count === 0) {
    if (payment.status === "PAID") return { alreadyConfirmed: true, payment };
    throw new UserError("Esta cobrança foi cancelada e não pode ser confirmada");
  }

  await notifyClient(payment.clientId, "Pagamento confirmado", `Recebemos ${formatCurrency(payment.amount)} — ${payment.description}.`, {
    type: "PAYMENT", link: payment.subscriptionId ? "/cliente/mensalidades" : "/cliente/pagamentos",
  });
  if (payment.type === "SUBSCRIPTION") await onSubscriptionPaymentConfirmed(payment);
  if (payment.projectId) await onProjectPaymentConfirmed(payment.projectId);
  return { alreadyConfirmed: false, payment };
}

/** Cancela uma cobrança ainda não paga (PENDING ou OVERDUE). Pagas nunca são canceladas. */
export async function cancelPayment(paymentId: string, reason?: string | null) {
  const current = await prisma.payment.findUnique({ where: { id: paymentId }, select: { notes: true } });
  if (!current) throw new UserError("Cobrança não encontrada");
  const res = await prisma.payment.updateMany({
    where: { id: paymentId, status: { in: ["PENDING", "OVERDUE"] } },
    data: { status: "CANCELLED", notes: reason ? [current.notes, `Cancelada: ${reason}`].filter(Boolean).join("\n") : undefined },
  });
  if (res.count === 0) throw new UserError("Apenas cobranças em aberto podem ser canceladas");
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { projectId: true } });
  if (payment?.projectId) await onProjectPaymentConfirmed(payment.projectId);
  return { cancelled: true };
}

/** Cobrança avulsa (EXTRA). Valida que o projeto (se houver) pertence ao cliente. */
export async function createExtraCharge(input: { clientId: string; projectId?: string | null; description: string; amount: number; dueDate?: Date | null }) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId }, select: { id: true } });
  if (!client) throw new UserError("Cliente não encontrado");
  if (input.projectId) {
    const project = await prisma.project.findFirst({ where: { id: input.projectId, clientId: input.clientId }, select: { id: true } });
    if (!project) throw new UserError("Projeto não pertence ao cliente selecionado");
  }
  const payment = await prisma.payment.create({
    data: {
      description: input.description, amount: new Prisma.Decimal(input.amount.toFixed(2)), type: "EXTRA", status: "PENDING",
      dueDate: input.dueDate ?? null, clientId: input.clientId, projectId: input.projectId || null,
    },
  });
  await notifyClient(input.clientId, "Nova cobrança", `${input.description} — ${formatCurrency(input.amount)}.`, { type: "PAYMENT", link: "/cliente/pagamentos" });
  return payment;
}
