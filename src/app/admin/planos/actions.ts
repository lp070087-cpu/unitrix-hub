"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { moneySchema } from "@/lib/billing/money";

const planSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  description: z.string().trim().max(2000).optional(),
  price: moneySchema,
  interval: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"], { errorMap: () => ({ message: "Intervalo inválido" }) }),
  category: z.enum(["HOSTING", "SUPPORT", "MAINTENANCE", "SERVICE"], { errorMap: () => ({ message: "Categoria inválida" }) }),
  features: z.array(z.string().trim().min(1).max(200)).max(40, "Máximo de 40 itens").default([]),
  active: z.boolean().default(true),
});

function revalidatePlans() {
  revalidatePath("/admin/planos");
  revalidatePath("/admin/assinaturas");
}

function toData(d: z.infer<typeof planSchema>) {
  return {
    name: d.name, description: d.description || null, price: new Prisma.Decimal(d.price.toFixed(2)), interval: d.interval,
    category: d.category, features: d.features.filter(Boolean), active: d.active,
  };
}

export async function createPlanAction(input: z.input<typeof planSchema>) {
  return safe(async () => {
    const session = await requireAdmin();
    const data = planSchema.parse(input);
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
    if (!user) throw new UserError("Usuário administrador não encontrado");
    await prisma.plan.create({ data: { ...toData(data), createdById: user.id } });
    revalidatePlans();
  }, "Plano criado");
}

export async function updatePlanAction(input: z.input<typeof planSchema> & { planId: string }) {
  return safe(async () => {
    await requireAdmin();
    const planId = z.string().min(1).max(64).parse(input.planId);
    const data = planSchema.parse(input);
    await prisma.plan.update({ where: { id: planId }, data: toData(data) });
    revalidatePlans();
  }, "Plano atualizado. Assinaturas existentes mantêm preço personalizado, se houver.");
}

export async function togglePlanAction(input: { planId: string; active: boolean }) {
  return safe(async () => {
    await requireAdmin();
    const { planId, active } = z.object({ planId: z.string().min(1).max(64), active: z.boolean() }).parse(input);
    await prisma.plan.update({ where: { id: planId }, data: { active } });
    revalidatePlans();
  }, input.active ? "Plano ativado" : "Plano desativado");
}

/** Exclui apenas planos sem assinaturas; caso contrário, desativa. */
export async function deletePlanAction(input: { planId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { planId } = z.object({ planId: z.string().min(1).max(64) }).parse(input);
    const count = await prisma.subscription.count({ where: { planId } });
    if (count > 0) {
      await prisma.plan.update({ where: { id: planId }, data: { active: false } });
      revalidatePlans();
      return { deleted: false, subscriptions: count };
    }
    await prisma.plan.delete({ where: { id: planId } });
    revalidatePlans();
    return { deleted: true, subscriptions: 0 };
  });
}
