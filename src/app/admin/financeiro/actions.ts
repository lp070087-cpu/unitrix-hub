"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/session";
import { safe } from "@/lib/server/action";
import { cancelPayment, confirmPayment, createExtraCharge, PAYMENT_METHODS } from "@/lib/billing/payments";
import { moneySchema } from "@/lib/billing/money";
import { optionalDateInputSchema } from "@/lib/billing/dates";

const id = z.string().min(1).max(64);

function revalidateFinance(extra: (string | null | undefined)[] = []) {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/assinaturas");
  revalidatePath("/cliente/pagamentos");
  revalidatePath("/cliente/mensalidades");
  for (const p of extra) if (p) revalidatePath(p);
}

const confirmSchema = z.object({
  paymentId: id,
  method: z.enum(Object.keys(PAYMENT_METHODS) as [string, ...string[]], { errorMap: () => ({ message: "Selecione a forma de pagamento" }) }),
  paidAt: optionalDateInputSchema,
  notes: z.string().trim().max(500, "Observação muito longa").optional(),
});

export async function confirmPaymentAction(input: z.input<typeof confirmSchema>) {
  return safe(async () => {
    const session = await requireAdmin();
    const data = confirmSchema.parse(input);
    const r = await confirmPayment(data.paymentId, { method: data.method, paidAt: data.paidAt, notes: data.notes }, session.user.email ?? session.user.id);
    revalidateFinance([r.payment.projectId ? `/admin/projetos/${r.payment.projectId}` : null, r.payment.projectId ? `/cliente/projetos/${r.payment.projectId}` : null]);
    return { alreadyConfirmed: r.alreadyConfirmed };
  });
}

const cancelSchema = z.object({ paymentId: id, reason: z.string().trim().max(300).optional() });

export async function cancelPaymentAction(input: z.input<typeof cancelSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = cancelSchema.parse(input);
    await cancelPayment(data.paymentId, data.reason);
    revalidateFinance();
    revalidatePath("/admin/projetos/[id]", "page");
  }, "Cobrança cancelada");
}

const chargeSchema = z.object({
  clientId: id,
  projectId: z.string().max(64).optional().transform((v) => v || null),
  description: z.string().trim().min(2, "Descreva a cobrança").max(200),
  amount: moneySchema,
  dueDate: optionalDateInputSchema,
});

export async function createChargeAction(input: z.input<typeof chargeSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = chargeSchema.parse(input);
    const p = await createExtraCharge(data);
    revalidateFinance([data.projectId ? `/admin/projetos/${data.projectId}` : null]);
    return { id: p.id };
  }, "Cobrança criada");
}
