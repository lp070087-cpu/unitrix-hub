import Link from "next/link";
import { AlertTriangle, ArrowDownLeft, BarChart3, Clock, Receipt, Repeat } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader, Stat } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentActions } from "@/components/shared/payment-actions";
import { NewChargeDialog } from "@/components/shared/new-charge-dialog";
import { Filters } from "@/components/shared/filters";
import { markOverdue } from "@/lib/billing/payments";
import { computeMRR } from "@/lib/billing/subscriptions";
import { startOfMonthUTC, todayUTC } from "@/lib/billing/dates";
import { formatDay } from "@/lib/billing/format";
import { formatCurrency, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, serialize, toNumber } from "@/lib/utils";
import { RevenueChart } from "./revenue-chart";

export const dynamic = "force-dynamic";

const LIMIT = 200;

type SP = Promise<{ status?: string; type?: string; client?: string }>;

export default async function FinanceiroPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  await markOverdue();
  const sp = await searchParams;

  const today = todayUTC();
  const monthStart = startOfMonthUTC(today);
  const nextMonth = startOfMonthUTC(today, 1);
  const sixStart = startOfMonthUTC(today, -5);

  const where: Prisma.PaymentWhereInput = {};
  if (sp.status && PAYMENT_STATUS_MAP[sp.status]) where.status = sp.status;
  if (sp.type && PAYMENT_TYPE_MAP[sp.type]) where.type = sp.type;
  if (sp.client) where.clientId = sp.client;

  const [receivedMonth, receivable, overdue, mrr, paid6, payments, clients, projects, total] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: monthStart, lt: nextMonth } }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { status: "OVERDUE" }, _sum: { amount: true }, _count: true }),
    computeMRR(),
    prisma.payment.findMany({ where: { status: "PAID", paidAt: { gte: sixStart, lt: nextMonth } }, select: { amount: true, paidAt: true, type: true } }),
    prisma.payment.findMany({
      where, take: LIMIT,
      orderBy: [{ createdAt: "desc" }],
      include: { client: { select: { id: true, name: true, company: true } }, project: { select: { id: true, title: true } }, subscription: { select: { id: true, plan: { select: { name: true } } } } },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
    prisma.project.findMany({ where: { status: { not: "CANCELLED" } }, orderBy: { title: "asc" }, select: { id: true, title: true, clientId: true } }),
    prisma.payment.count({ where }),
  ]);

  // Recebimentos dos últimos 6 meses (somente dados reais).
  const months = Array.from({ length: 6 }, (_, i) => startOfMonthUTC(today, i - 5));
  const chart = months.map((m) => ({
    key: `${m.getUTCFullYear()}-${m.getUTCMonth()}`,
    month: new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(m).replace(".", ""),
    projetos: 0, recorrente: 0,
  }));
  let recurring6 = 0;
  let projects6 = 0;
  for (const p of paid6) {
    if (!p.paidAt) continue;
    const row = chart.find((c) => c.key === `${p.paidAt!.getUTCFullYear()}-${p.paidAt!.getUTCMonth()}`);
    const v = toNumber(p.amount);
    if (p.type === "SUBSCRIPTION") { recurring6 += v; if (row) row.recorrente += v; }
    else { projects6 += v; if (row) row.projetos += v; }
  }
  const total6 = recurring6 + projects6;
  const recurringShare = total6 > 0 ? Math.round((recurring6 / total6) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Receita"
        title="Financeiro"
        description="Cobranças de projetos, mensalidades e avulsas. Confirmação manual de recebimentos."
        actions={<NewChargeDialog clients={serialize(clients)} projects={serialize(projects)} />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Recebido no mês" icon={ArrowDownLeft} value={formatCurrency(receivedMonth._sum.amount)} hint={`${receivedMonth._count} ${receivedMonth._count === 1 ? "pagamento" : "pagamentos"}`} />
        <Stat label="A receber" icon={Clock} value={formatCurrency(receivable._sum.amount)} hint={`${receivable._count} em aberto no prazo`} />
        <Stat label="Em atraso" icon={AlertTriangle} value={<span className={overdue._count ? "text-danger" : undefined}>{formatCurrency(overdue._sum.amount)}</span>} hint={`${overdue._count} vencidas`} />
        <Stat label="MRR" icon={Repeat} value={formatCurrency(mrr)} hint={<Link href="/admin/assinaturas" className="hover:text-foreground">Assinaturas ativas →</Link>} />
      </div>

      <Card>
        <CardHeader title="Recebimentos · últimos 6 meses" description={total6 > 0 ? `${formatCurrency(total6)} recebidos — ${recurringShare}% recorrente, ${100 - recurringShare}% projetos` : undefined} />
        <CardBody>
          {total6 > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <RevenueChart data={chart.map(({ month, projetos, recorrente }) => ({ month, projetos, recorrente }))} />
              <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-border bg-border lg:grid-cols-1">
                <div className="bg-surface-sunken p-4"><dt className="eyebrow">Projetos</dt><dd className="num mt-1 text-lg text-foreground">{formatCurrency(projects6)}</dd></div>
                <div className="bg-surface-sunken p-4"><dt className="eyebrow">Recorrente</dt><dd className="num mt-1 text-lg text-foreground">{formatCurrency(recurring6)}</dd></div>
              </dl>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Sem recebimentos no período" description="O gráfico aparece quando houver pagamentos confirmados nos últimos 6 meses." className="py-10" />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cobranças" description={total > LIMIT ? `Exibindo as ${LIMIT} mais recentes de ${total}` : `${total} ${total === 1 ? "cobrança" : "cobranças"}`} />
        <CardBody className="space-y-4 px-0 pb-0">
          <div className="px-5">
            <Filters filters={[
              { name: "status", label: "Status", options: Object.entries(PAYMENT_STATUS_MAP).map(([k, v]) => [k, v.label]) },
              { name: "type", label: "Tipo", options: Object.entries(PAYMENT_TYPE_MAP) },
              { name: "client", label: "Cliente", options: clients.map((c) => [c.id, c.name]) },
            ]} />
          </div>
          {payments.length === 0 ? (
            <EmptyState icon={Receipt} title="Nenhuma cobrança" description={Object.keys(where).length ? "Nenhum resultado para os filtros selecionados." : "Cobranças de projetos e assinaturas aparecem aqui."} className="border-t border-border" />
          ) : (
            <>
              <ul className="divide-y divide-border border-t border-border md:hidden">
                {payments.map((p) => (
                  <li key={p.id} className="space-y-2 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{p.client.name}</p>
                        <p className="truncate text-xs text-foreground-muted">{p.description}</p>
                      </div>
                      <span className="num shrink-0 text-sm">{formatCurrency(p.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} />
                        <span className="num text-2xs text-foreground-dim">{p.status === "PAID" ? `Pago ${formatDay(p.paidAt)}` : `Vence ${formatDay(p.dueDate)}`}</span>
                      </div>
                      <PaymentActions payment={serialize({ id: p.id, status: p.status, amount: p.amount, description: p.description })} compact />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden border-t border-border md:block">
                <Table>
                  <THead><TR><TH>Cliente</TH><TH>Descrição</TH><TH>Tipo</TH><TH>Vencimento</TH><TH>Status</TH><TH className="text-right">Valor</TH><TH className="text-right">Ações</TH></TR></THead>
                  <TBody>
                    {payments.map((p) => (
                      <TR key={p.id}>
                        <TD className="max-w-[180px]"><span className="block truncate">{p.client.name}</span>{p.client.company && <span className="block truncate text-xs text-foreground-dim">{p.client.company}</span>}</TD>
                        <TD className="max-w-[260px]">
                          <span className="block truncate text-[13px]">{p.description}</span>
                          {p.project ? <Link href={`/admin/projetos/${p.project.id}`} className="block truncate text-xs text-foreground-dim hover:text-accent">{p.project.title}</Link>
                            : p.subscription ? <Link href={`/admin/assinaturas?sub=${p.subscription.id}`} className="block truncate text-xs text-foreground-dim hover:text-accent">{p.subscription.plan.name}</Link> : null}
                        </TD>
                        <TD className="whitespace-nowrap text-[13px] text-foreground-muted">{PAYMENT_TYPE_MAP[p.type] ?? p.type}</TD>
                        <TD className="num whitespace-nowrap text-[13px] text-foreground-muted">{p.status === "PAID" ? <>Pago {formatDay(p.paidAt)}</> : formatDay(p.dueDate)}</TD>
                        <TD><StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} /></TD>
                        <TD className="num whitespace-nowrap text-right">{formatCurrency(p.amount)}</TD>
                        <TD className="text-right"><PaymentActions payment={serialize({ id: p.id, status: p.status, amount: p.amount, description: p.description })} /></TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
