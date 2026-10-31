import Link from "next/link";
import { ArrowUpRight, FolderKanban, Inbox, Wallet, Repeat, FileSignature, ClipboardList, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, Progress, Stat } from "@/components/ui/states";
import { LEAD_STATUS_MAP, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, PROJECT_STATUS_MAP, formatCurrency, formatDate, toNumber } from "@/lib/utils";

export const metadata = { title: "Visão geral" };

const monthly = (price: number, interval: string) => (interval === "YEARLY" ? price / 12 : interval === "QUARTERLY" ? price / 3 : price);

export default async function AdminDashboard() {
  const session = await auth();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [receivedMonth, receivable, overdue, activeProjects, subs, leads, newLeadCount, pendingContracts, pendingBriefings, upcoming] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", paidAt: { gte: monthStart } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, _count: true, where: { OR: [{ status: "OVERDUE" }, { status: "PENDING", dueDate: { lt: now } }] } }),
    prisma.project.findMany({ where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } }, orderBy: { endDate: "asc" }, take: 6, include: { client: { select: { name: true } } } }),
    prisma.subscription.findMany({ where: { status: { in: ["ACTIVE", "PAST_DUE"] } }, include: { plan: { select: { price: true, interval: true } } } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.contract.count({ where: { status: { in: ["SENT", "VIEWED"] } } }),
    prisma.briefing.count({ where: { status: "SUBMITTED" } }),
    prisma.payment.findMany({ where: { status: { in: ["PENDING", "OVERDUE"] } }, orderBy: [{ dueDate: "asc" }], take: 6, include: { client: { select: { name: true } } } }),
  ]);
  const mrr = subs.reduce((a, s) => a + monthly(toNumber(s.price ?? s.plan.price), s.plan.interval), 0);
  const first = (session?.user?.name || "").split(" ")[0];

  const attention = [
    newLeadCount > 0 && { icon: Inbox, text: `${newLeadCount} solicitação${newLeadCount > 1 ? "ões" : ""} nova${newLeadCount > 1 ? "s" : ""}`, href: "/admin/solicitacoes?status=NEW" },
    pendingBriefings > 0 && { icon: ClipboardList, text: `${pendingBriefings} briefing${pendingBriefings > 1 ? "s" : ""} aguardando revisão`, href: "/admin/briefings" },
    pendingContracts > 0 && { icon: FileSignature, text: `${pendingContracts} contrato${pendingContracts > 1 ? "s" : ""} aguardando assinatura`, href: "/admin/contratos" },
    overdue._count > 0 && { icon: AlertTriangle, text: `${overdue._count} cobrança${overdue._count > 1 ? "s" : ""} em atraso`, href: "/admin/financeiro?status=OVERDUE" },
  ].filter(Boolean) as { icon: any; text: string; href: string }[];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-2">{formatDate(now, { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })}</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">
          {first ? <>Olá, {first}.</> : "Visão geral"} <span className="font-display italic font-normal text-foreground-muted">Eis o estúdio hoje.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Recebido no mês" value={formatCurrency(receivedMonth._sum.amount)} icon={Wallet} />
        <Stat label="A receber" value={formatCurrency(receivable._sum.amount)} hint={overdue._count ? <span className="text-danger">{formatCurrency(overdue._sum.amount)} em atraso</span> : "Nenhum atraso"} />
        <Stat label="Receita recorrente" value={formatCurrency(mrr)} hint={`${subs.length} assinatura${subs.length === 1 ? "" : "s"} ativa${subs.length === 1 ? "" : "s"} · MRR`} icon={Repeat} />
        <Stat label="Projetos ativos" value={activeProjects.length} icon={FolderKanban} />
      </div>

      {attention.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {attention.map((a) => (
            <Link key={a.href} href={a.href} className="group flex items-center gap-3 rounded-lg border border-border bg-surface-sunken px-4 py-3 text-[13px] text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground">
              <a.icon className="h-4 w-4 text-accent" strokeWidth={1.6} />
              <span className="flex-1">{a.text}</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Projetos em andamento" action={<Link href="/admin/projetos" className="text-[13px] text-accent hover:underline">Pipeline</Link>} />
          {activeProjects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="Nenhum projeto ativo" description="Projetos em planejamento, desenvolvimento ou validação aparecem aqui." />
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {activeProjects.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projetos/${p.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 hover:bg-surface-hover/50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="truncate text-xs text-foreground-dim">{p.client.name} · entrega {formatDate(p.endDate)}</p>
                    </div>
                    <Badge tone={PROJECT_STATUS_MAP[p.status]?.tone}>{PROJECT_STATUS_MAP[p.status]?.label}</Badge>
                    <div className="col-span-2 flex items-center gap-3"><Progress value={p.progress} /><span className="w-9 text-right text-xs text-foreground-dim num">{p.progress}%</span></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Solicitações recentes" action={<Link href="/admin/solicitacoes" className="text-[13px] text-accent hover:underline">Ver todas</Link>} />
          {leads.length === 0 ? (
            <EmptyState icon={Inbox} title="Sem solicitações" description="Pedidos de orçamento do site chegam aqui." />
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {leads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{l.name}{l.company ? <span className="text-foreground-dim"> · {l.company}</span> : null}</p>
                    <p className="truncate text-xs text-foreground-dim">{l.projectType} · {formatDate(l.createdAt)}</p>
                  </div>
                  <Badge tone={LEAD_STATUS_MAP[l.status]?.tone}>{LEAD_STATUS_MAP[l.status]?.label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Próximos recebimentos" action={<Link href="/admin/financeiro" className="text-[13px] text-accent hover:underline">Financeiro</Link>} />
        {upcoming.length === 0 ? (
          <EmptyState icon={Wallet} title="Nenhuma cobrança em aberto" />
        ) : (
          <ul className="grid divide-y divide-border border-t border-border md:grid-cols-2 md:divide-y-0">
            {upcoming.map((p) => {
              const late = p.status === "OVERDUE" || (p.dueDate && p.dueDate < now);
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 md:border-b md:border-border md:odd:border-r">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{p.client.name}</p>
                    <p className="truncate text-xs text-foreground-dim">{PAYMENT_TYPE_MAP[p.type] ?? p.type} · {p.dueDate ? formatDate(p.dueDate) : "sem vencimento"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm num">{formatCurrency(p.amount)}</p>
                    <Badge tone={late ? "danger" : PAYMENT_STATUS_MAP[p.status]?.tone}>{late ? "Atrasado" : PAYMENT_STATUS_MAP[p.status]?.label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
