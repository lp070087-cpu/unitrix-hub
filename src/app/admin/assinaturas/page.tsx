import { AlertTriangle, PauseCircle, Repeat, TrendingUp, XCircle } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { PageHeader, Stat } from "@/components/ui/states";
import { Filters } from "@/components/shared/filters";
import { markOverdue } from "@/lib/billing/payments";
import { computeMRR, effectivePrice, monthlyValue } from "@/lib/billing/subscriptions";
import { startOfMonthUTC, todayUTC } from "@/lib/billing/dates";
import { formatCurrency, serialize, SUBSCRIPTION_STATUS_MAP } from "@/lib/utils";
import { NewSubscriptionDialog } from "./new-subscription-dialog";
import { SubscriptionsList } from "./subscriptions-list";

export const dynamic = "force-dynamic";

type SP = Promise<{ status?: string; plan?: string; client?: string; sub?: string }>;

export default async function AssinaturasPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  await markOverdue();
  const sp = await searchParams;
  const monthStart = startOfMonthUTC(todayUTC());

  const where: Prisma.SubscriptionWhereInput = {};
  if (sp.status && SUBSCRIPTION_STATUS_MAP[sp.status]) where.status = sp.status;
  if (sp.plan) where.planId = sp.plan;
  if (sp.client) where.clientId = sp.client;

  const [mrr, counts, canceledMonth, subs, plans, clients] = await Promise.all([
    computeMRR(),
    prisma.subscription.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.subscription.count({ where: { status: "CANCELED", canceledAt: { gte: monthStart } } }),
    prisma.subscription.findMany({
      where,
      orderBy: [{ status: "asc" }, { nextBilling: "asc" }],
      include: {
        client: { select: { id: true, name: true, company: true } },
        plan: { select: { id: true, name: true, price: true, interval: true, category: true } },
        payments: { orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }], take: 24, select: { id: true, description: true, amount: true, status: true, dueDate: true, paidAt: true, chargeKey: true, method: true } },
      },
    }),
    prisma.plan.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, price: true, interval: true, active: true } }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const rows = subs.map((s) => ({ ...s, effectivePrice: effectivePrice(s), monthly: monthlyValue(effectivePrice(s), s.plan.interval) }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Receita"
        title="Assinaturas"
        description="Planos recorrentes por cliente. Cobranças geradas por período, sem duplicidade."
        actions={<NewSubscriptionDialog clients={serialize(clients)} plans={serialize(plans.filter((p) => p.active))} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1"><Stat label="MRR" icon={TrendingUp} value={formatCurrency(mrr)} hint="Trimestral ÷ 3 · anual ÷ 12" /></div>
        <Stat label="Ativas" icon={Repeat} value={count("ACTIVE")} />
        <Stat label="Pausadas" icon={PauseCircle} value={count("PAUSED")} />
        <Stat label="Em atraso" icon={AlertTriangle} value={<span className={count("PAST_DUE") ? "text-danger" : undefined}>{count("PAST_DUE")}</span>} />
        <Stat label="Canceladas no mês" icon={XCircle} value={canceledMonth} />
      </div>

      <Filters filters={[
        { name: "status", label: "Status", options: Object.entries(SUBSCRIPTION_STATUS_MAP).map(([k, v]) => [k, v.label]) },
        { name: "plan", label: "Plano", options: plans.map((p) => [p.id, p.name]) },
        { name: "client", label: "Cliente", options: clients.map((c) => [c.id, c.name]) },
      ]} />

      <SubscriptionsList subscriptions={serialize(rows)} highlight={sp.sub} hasFilters={Object.keys(where).length > 0} hasPlans={plans.some((p) => p.active)} />
    </div>
  );
}
