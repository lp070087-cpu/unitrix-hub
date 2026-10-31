import { redirect } from "next/navigation";
import { Check, CreditCard, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDay } from "@/lib/billing/format";
import { effectivePrice } from "@/lib/billing/subscriptions";
import { formatCurrency, PAYMENT_STATUS_MAP, PLAN_CATEGORY_MAP, PLAN_INTERVAL_MAP, SUBSCRIPTION_STATUS_MAP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteMensalidadesPage() {
  const { clientId } = await requireClient().catch(() => redirect("/auth/login?callbackUrl=/cliente/mensalidades"));
  const subs = await prisma.subscription.findMany({
    where: { clientId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, status: true, startedAt: true, nextBilling: true, canceledAt: true, pausedAt: true, price: true, billingDay: true,
      plan: { select: { name: true, description: true, price: true, interval: true, category: true, features: true } },
      payments: { where: { clientId, status: { not: "CANCELLED" } }, orderBy: [{ dueDate: "desc" }], take: 24, select: { id: true, description: true, amount: true, status: true, dueDate: true, paidAt: true } },
    },
  });
  const hasOpen = subs.some((s) => s.payments.some((p) => p.status === "PENDING" || p.status === "OVERDUE"));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financeiro" title="Mensalidades" description="Seus planos recorrentes de hospedagem, suporte e manutenção." />

      {hasOpen && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
          <p className="text-[13px] leading-relaxed text-foreground-muted">A Unitrix enviará os dados de pagamento de cada período. A confirmação aparece aqui após o recebimento.</p>
        </div>
      )}

      {subs.length === 0 ? (
        <Card><EmptyState icon={CreditCard} title="Nenhum plano ativo" description="Planos de hospedagem, suporte ou manutenção contratados com a Unitrix aparecem aqui." /></Card>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => {
            const features = Array.isArray(s.plan.features) ? (s.plan.features as unknown[]).filter((f): f is string => typeof f === "string") : [];
            return (
              <Card key={s.id} className="overflow-hidden">
                <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="eyebrow">{PLAN_CATEGORY_MAP[s.plan.category] ?? s.plan.category}</span>
                      <StatusBadge map={SUBSCRIPTION_STATUS_MAP} status={s.status} />
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">{s.plan.name}</h2>
                    {s.plan.description && <p className="mt-1 text-[13px] leading-relaxed text-foreground-muted">{s.plan.description}</p>}
                    {features.length > 0 && (
                      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                        {features.map((f, i) => <li key={i} className="flex gap-2 text-[13px] text-foreground-muted"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.8} />{f}</li>)}
                      </ul>
                    )}
                  </div>
                  <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-border bg-border md:grid-cols-1">
                    <div className="bg-surface-sunken p-3">
                      <dt className="eyebrow">Valor</dt>
                      <dd className="num mt-1 text-foreground">{formatCurrency(effectivePrice(s))} <span className="text-2xs text-foreground-dim">{PLAN_INTERVAL_MAP[s.plan.interval]?.toLowerCase()}</span></dd>
                    </div>
                    <div className="bg-surface-sunken p-3">
                      <dt className="eyebrow">{s.status === "CANCELED" ? "Cancelada em" : s.status === "PAUSED" ? "Pausada em" : "Próximo vencimento"}</dt>
                      <dd className="num mt-1 text-foreground">{s.status === "CANCELED" ? formatDay(s.canceledAt) : s.status === "PAUSED" ? formatDay(s.pausedAt) : formatDay(s.nextBilling)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="border-t border-border">
                  <p className="eyebrow px-5 pt-4 sm:px-6">Histórico de cobranças</p>
                  {s.payments.length === 0 ? (
                    <p className="px-5 pb-5 pt-2 text-[13px] text-foreground-dim sm:px-6">Nenhuma cobrança gerada ainda.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-border">
                      {s.payments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] text-foreground">{p.description}</p>
                            <p className="num mt-0.5 text-2xs text-foreground-dim">{p.status === "PAID" ? `Pago em ${formatDay(p.paidAt)}` : `Vencimento ${formatDay(p.dueDate)}`}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="num text-[13px]">{formatCurrency(p.amount)}</span>
                            <StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
