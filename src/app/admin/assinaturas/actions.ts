"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { notifyClient } from "@/lib/server/notify";
import { optionalMoneySchema } from "@/lib/billing/money";
import { dateInputSchema } from "@/lib/billing/dates";
import { firstBillingDate, generateSubscriptionCharge, nextFutureBilling } from "@/lib/billing/subscriptions";

const id = z.string().min(1).max(64);

function revalidateSubs() {
  revalidatePath("/admin/assinaturas");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/planos");
  revalidatePath("/cliente/mensalidades");
  revalidatePath("/cliente");
}

const createSchema = z.object({
  clientId: id,
  planId: id,
  price: optionalMoneySchema,
  billingDay: z.coerce.number({ invalid_type_error: "Dia inválido" }).int().min(1, "Dia entre 1 e 28").max(28, "Dia entre 1 e 28"),
  startDate: dateInputSchema,
  notes: z.string().trim().max(2000).optional(),
});

export async function createSubscriptionAction(input: z.input<typeof createSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = createSchema.parse(input);
    const [client, plan] = await Promise.all([
      prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } }),
      prisma.plan.findUnique({ where: { id: data.planId }, select: { id: true, active: true, name: true } }),
    ]);
    if (!client) throw new UserError("Cliente não encontrado");
    if (!plan || !plan.active) throw new UserError("Selecione um plano ativo");
    const sub = await prisma.subscription.create({
      data: {
        clientId: client.id, planId: plan.id, status: "ACTIVE", startedAt: data.startDate, billingDay: data.billingDay,
        price: data.price !== undefined ? new Prisma.Decimal(data.price.toFixed(2)) : null,
        nextBilling: firstBillingDate(data.startDate, data.billingDay), notes: data.notes || null,
      },
    });
    await notifyClient(client.id, "Assinatura ativada", `Plano ${plan.name} ativado na sua conta.`, { type: "PAYMENT", link: "/cliente/mensalidades" });
    revalidateSubs();
    return { id: sub.id };
  }, "Assinatura criada");
}

async function getSub(subscriptionId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId }, include: { plan: { select: { name: true, interval: true } } } });
  if (!sub) throw new UserError("Assinatura não encontrada");
  return sub;
}

export async function pauseSubscriptionAction(input: { subscriptionId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { subscriptionId } = z.object({ subscriptionId: id }).parse(input);
    const res = await prisma.subscription.updateMany({ where: { id: subscriptionId, status: { in: ["ACTIVE", "PAST_DUE"] } }, data: { status: "PAUSED", pausedAt: new Date() } });
    if (res.count === 0) throw new UserError("Apenas assinaturas ativas ou em atraso podem ser pausadas");
    const sub = await getSub(subscriptionId);
    await notifyClient(sub.clientId, "Assinatura pausada", `O plano ${sub.plan.name} foi pausado.`, { type: "PAYMENT", link: "/cliente/mensalidades" });
    revalidateSubs();
  }, "Assinatura pausada");
}

export async function resumeSubscriptionAction(input: { subscriptionId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { subscriptionId } = z.object({ subscriptionId: id }).parse(input);
    const sub = await getSub(subscriptionId);
    if (sub.status !== "PAUSED") throw new UserError("Apenas assinaturas pausadas podem ser retomadas");
    const base = sub.nextBilling ?? firstBillingDate(sub.startedAt, sub.billingDay);
    const nextBilling = nextFutureBilling(base, sub.plan.interval, sub.billingDay);
    const overdue = await prisma.payment.count({ where: { subscriptionId, status: "OVERDUE" } });
    await prisma.subscription.update({ where: { id: subscriptionId }, data: { status: overdue ? "PAST_DUE" : "ACTIVE", pausedAt: null, nextBilling } });
    await notifyClient(sub.clientId, "Assinatura retomada", `O plano ${sub.plan.name} foi retomado.`, { type: "PAYMENT", link: "/cliente/mensalidades" });
    revalidateSubs();
  }, "Assinatura retomada");
}

export async function cancelSubscriptionAction(input: { subscriptionId: string; reason?: string }) {
  return safe(async () => {
    await requireAdmin();
    const { subscriptionId, reason } = z.object({ subscriptionId: id, reason: z.string().trim().max(500).optional() }).parse(input);
    const res = await prisma.subscription.updateMany({
      where: { id: subscriptionId, status: { not: "CANCELED" } },
      data: { status: "CANCELED", canceledAt: new Date(), cancelReason: reason || null },
    });
    if (res.count === 0) throw new UserError("Assinatura já cancelada");
    const sub = await getSub(subscriptionId);
    await notifyClient(sub.clientId, "Assinatura cancelada", `O plano ${sub.plan.name} foi cancelado.`, { type: "PAYMENT", link: "/cliente/mensalidades" });
    revalidateSubs();
  }, "Assinatura cancelada");
}

export async function generateChargeAction(input: { subscriptionId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { subscriptionId } = z.object({ subscriptionId: id }).parse(input);
    const r = await generateSubscriptionCharge(subscriptionId);
    revalidateSubs();
    return r;
  });
}
