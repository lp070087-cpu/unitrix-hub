import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserError } from "@/lib/server/action";
import { notifyClient } from "@/lib/server/notify";
import { formatDate, toNumber } from "@/lib/utils";
import { addDaysUTC, todayUTC } from "./dates";
import { markOverdue } from "./overdue";

export type PlanInterval = "MONTHLY" | "QUARTERLY" | "YEARLY";
export const INTERVAL_MONTHS: Record<string, number> = { MONTHLY: 1, QUARTERLY: 3, YEARLY: 12 };

function daysInMonthUTC(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Data no mês (year, month) no dia `day`, limitado ao último dia do mês. */
function dateAtDay(year: number, month: number, day: number) {
  const norm = new Date(Date.UTC(year, month, 1));
  const y = norm.getUTCFullYear();
  const m = norm.getUTCMonth();
  return new Date(Date.UTC(y, m, Math.min(day, daysInMonthUTC(y, m))));
}

/** Avança `date` um período do intervalo, ancorando no dia de cobrança (1–28). */
export function addInterval(date: Date, interval: string, billingDay?: number | null): Date {
  const months = INTERVAL_MONTHS[interval] ?? 1;
  const day = billingDay ?? date.getUTCDate();
  return dateAtDay(date.getUTCFullYear(), date.getUTCMonth() + months, day);
}

/** Primeiro vencimento a partir da data de início: próximo `billingDay` em ou após o início. */
export function firstBillingDate(start: Date, billingDay?: number | null): Date {
  const day = billingDay ?? start.getUTCDate();
  const sameMonth = dateAtDay(start.getUTCFullYear(), start.getUTCMonth(), day);
  return sameMonth.getTime() >= start.getTime() ? sameMonth : dateAtDay(start.getUTCFullYear(), start.getUTCMonth() + 1, day);
}

/** Próximo vencimento futuro (>= hoje) partindo de uma data de referência. */
export function nextFutureBilling(from: Date, interval: string, billingDay?: number | null, today = todayUTC()): Date {
  let d = from;
  let guard = 0;
  while (d.getTime() < today.getTime() && guard++ < 1000) d = addInterval(d, interval, billingDay);
  return d;
}

/** Chave idempotente do período: period:YYYY-MM | period:YYYY-Qn | period:YYYY. */
export function periodKey(date: Date, interval: string): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  if (interval === "YEARLY") return `period:${y}`;
  if (interval === "QUARTERLY") return `period:${y}-Q${Math.floor(m / 3) + 1}`;
  return `period:${y}-${String(m + 1).padStart(2, "0")}`;
}

export function periodLabel(date: Date, interval: string): string {
  const y = date.getUTCFullYear();
  if (interval === "YEARLY") return `${y}`;
  if (interval === "QUARTERLY") return `${Math.floor(date.getUTCMonth() / 3) + 1}º trimestre ${y}`;
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/** Valor mensal normalizado (trimestral/3, anual/12). */
export function monthlyValue(price: unknown, interval: string): number {
  return toNumber(price) / (INTERVAL_MONTHS[interval] ?? 1);
}

export function effectivePrice(sub: { price: unknown; plan: { price: unknown } }): number {
  return sub.price !== null && sub.price !== undefined ? toNumber(sub.price) : toNumber(sub.plan.price);
}

/** MRR das assinaturas ativas. */
export async function computeMRR(): Promise<number> {
  const subs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { price: true, plan: { select: { price: true, interval: true } } },
  });
  const total = subs.reduce((s, sub) => s + monthlyValue(effectivePrice(sub), sub.plan.interval), 0);
  return Math.round(total * 100) / 100;
}

export type ChargeResult = { created: boolean; paymentId?: string; chargeKey: string };

/**
 * Gera a cobrança do período atual (baseado em nextBilling). Idempotente:
 * a unique (subscriptionId, chargeKey) impede duplicidade; P2002 → "já gerada".
 */
export async function generateSubscriptionCharge(subscriptionId: string): Promise<ChargeResult> {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId }, include: { plan: true } });
  if (!sub) throw new UserError("Assinatura não encontrada");
  if (sub.status !== "ACTIVE" && sub.status !== "PAST_DUE") {
    throw new UserError("Só é possível gerar cobranças de assinaturas ativas ou em atraso");
  }

  let due = sub.nextBilling;
  if (!due) {
    due = firstBillingDate(sub.startedAt, sub.billingDay);
    await prisma.subscription.update({ where: { id: sub.id }, data: { nextBilling: due } });
  }
  const chargeKey = periodKey(due, sub.plan.interval);
  const amount = effectivePrice(sub);
  if (amount <= 0) throw new UserError("Assinatura sem valor definido");

  try {
    const payment = await prisma.payment.create({
      data: {
        description: `${sub.plan.name} · ${periodLabel(due, sub.plan.interval)}`,
        amount: new Prisma.Decimal(amount.toFixed(2)),
        type: "SUBSCRIPTION",
        status: "PENDING",
        dueDate: due,
        chargeKey,
        clientId: sub.clientId,
        subscriptionId: sub.id,
      },
    });
    await notifyClient(
      sub.clientId,
      "Nova mensalidade disponível",
      `${sub.plan.name} — vencimento em ${formatDate(due, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}.`,
      { type: "PAYMENT", link: "/cliente/mensalidades" }
    );
    return { created: true, paymentId: payment.id, chargeKey };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { created: false, chargeKey };
    }
    throw e;
  }
}

/**
 * Após confirmar uma cobrança SUBSCRIPTION: avança nextBilling somente se o período pago
 * for o período atual (comparando chargeKey) e reativa PAST_DUE → ACTIVE se não houver atrasos.
 */
export async function onSubscriptionPaymentConfirmed(payment: { subscriptionId: string | null; chargeKey: string | null }) {
  if (!payment.subscriptionId) return;
  const sub = await prisma.subscription.findUnique({ where: { id: payment.subscriptionId }, include: { plan: true } });
  if (!sub || sub.status === "CANCELED") return;

  if (sub.nextBilling && payment.chargeKey && payment.chargeKey === periodKey(sub.nextBilling, sub.plan.interval)) {
    // Condição otimista em nextBilling evita avançar duas vezes em confirmações concorrentes.
    await prisma.subscription.updateMany({
      where: { id: sub.id, nextBilling: sub.nextBilling },
      data: { nextBilling: addInterval(sub.nextBilling, sub.plan.interval, sub.billingDay) },
    });
  }

  if (sub.status === "PAST_DUE") {
    const overdue = await prisma.payment.count({ where: { subscriptionId: sub.id, status: "OVERDUE" } });
    if (overdue === 0) await prisma.subscription.update({ where: { id: sub.id }, data: { status: "ACTIVE" } });
  }
}

/** Ciclo de cobrança: gera cobranças com nextBilling <= hoje+5 e marca PAST_DUE. */
export async function runBillingCycle() {
  const horizon = addDaysUTC(todayUTC(), 5);
  const due = await prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "PAST_DUE"] }, OR: [{ nextBilling: { lte: horizon } }, { nextBilling: null }] },
    select: { id: true },
  });

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  for (const s of due) {
    try {
      const r = await generateSubscriptionCharge(s.id);
      if (r.created) generated++;
      else skipped++;
    } catch (e) {
      failed++;
      console.error("[billing] falha ao gerar cobrança", s.id, (e as Error).message);
    }
  }

  // Cobranças recém-geradas já vencidas (recuperação de períodos) entram como atrasadas.
  const overdue = await markOverdue();
  const pastDue = await prisma.subscription.updateMany({
    where: { status: "ACTIVE", payments: { some: { status: "OVERDUE" } } },
    data: { status: "PAST_DUE" },
  });

  return { evaluated: due.length, generated, skipped, failed, markedOverdue: overdue.markedOverdue, markedPastDue: pastDue.count };
}
