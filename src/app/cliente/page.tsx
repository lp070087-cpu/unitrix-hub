import Link from "next/link";
import { ArrowUpRight, FileSignature, FolderKanban, Presentation, Wallet, ClipboardList, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, Progress } from "@/components/ui/states";
import { MILESTONE_STATUS_MAP, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, PROJECT_STATUS_MAP, cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Início" };

export default async function ClientHome() {
  const { clientId, client } = await requireClient();
  const [project, contractsToSign, presentations, payments, notifications, briefingsOpen] = await Promise.all([
    prisma.project.findFirst({
      where: { clientId, status: { notIn: ["CANCELLED"] } }, orderBy: [{ updatedAt: "desc" }],
      include: { milestones: { orderBy: { order: "asc" } }, updates: { where: { visible: true }, orderBy: { createdAt: "desc" }, take: 3 }, delivery: { select: { status: true } } },
    }),
    prisma.contract.findMany({ where: { clientId, status: { in: ["SENT", "VIEWED"] } }, select: { id: true, title: true, slug: true } }),
    prisma.presentation.findMany({ where: { clientId, status: { in: ["SENT", "VIEWED"] } }, select: { id: true, title: true, slug: true }, take: 3 }),
    prisma.payment.findMany({ where: { clientId, status: { in: ["PENDING", "OVERDUE"] } }, orderBy: { dueDate: "asc" }, take: 4 }),
    prisma.notification.findMany({ where: { clientId, audience: "CLIENT" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.briefing.findMany({ where: { clientId, status: { in: ["DRAFT", "REVISION_REQUESTED"] } }, select: { id: true, title: true, status: true } }),
  ]);
  const first = client.name.split(" ")[0];

  const todo = [
    ...contractsToSign.map((c) => ({ icon: FileSignature, text: `Assinar: ${c.title}`, href: `/contrato/${c.slug}` })),
    ...briefingsOpen.map((b) => ({ icon: ClipboardList, text: b.status === "REVISION_REQUESTED" ? `Ajustar briefing: ${b.title}` : `Concluir briefing: ${b.title}`, href: `/cliente/briefing/${b.id}` })),
    ...presentations.map((p) => ({ icon: Presentation, text: `Ver proposta: ${p.title}`, href: `/apresentacao/${p.slug}` })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-2">{client.company || "Portal do cliente"}</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Olá, {first}. <span className="font-display italic font-normal text-foreground-muted">Acompanhe sua entrega.</span></h1>
      </div>

      {todo.length > 0 && (
        <Card className="border-accent/25 bg-accent/[0.04]">
          <CardHeader title="Aguardando você" description="Itens que dependem da sua ação para o projeto avançar." />
          <ul className="divide-y divide-border border-t border-border">
            {todo.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-surface-hover/50">
                  <t.icon className="h-4 w-4 text-accent" strokeWidth={1.6} /><span className="flex-1">{t.text}</span><ArrowUpRight className="h-4 w-4 text-foreground-dim" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          {!project ? (
            <EmptyState icon={FolderKanban} title="Seu projeto aparecerá aqui" description="Assim que o projeto for iniciado, você acompanha etapas, prazos e entregas por aqui." />
          ) : (
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="eyebrow mb-1.5">Projeto atual</p>
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="mt-0.5 text-[13px] text-foreground-muted">Previsão de entrega: {formatDate(project.endDate)}</p>
                </div>
                <Badge tone={PROJECT_STATUS_MAP[project.status]?.tone}>{PROJECT_STATUS_MAP[project.status]?.label}</Badge>
              </div>
              <div className="mt-6 flex items-end gap-4">
                <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] num">{project.progress}<span className="text-xl text-foreground-dim">%</span></span>
                <Progress value={project.progress} className="mb-2" />
              </div>
              {project.milestones.length > 0 && (
                <ol className="mt-6 space-y-0">
                  {project.milestones.map((m, i) => {
                    const done = m.status === "COMPLETED";
                    const cur = m.status === "IN_PROGRESS";
                    return (
                      <li key={m.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < project.milestones.length - 1 && <span className={cn("absolute left-[7px] top-5 h-[calc(100%-12px)] w-px", done ? "bg-accent/50" : "bg-border")} />}
                        <span className={cn("mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2", done ? "border-accent bg-accent" : cur ? "border-accent bg-background" : "border-border-strong bg-background")} />
                        <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                          <span className={cn("text-sm", done ? "text-foreground-muted" : "text-foreground")}>{m.title}</span>
                          <span className="text-xs text-foreground-dim">{m.completedAt ? formatDate(m.completedAt) : m.dueDate ? formatDate(m.dueDate) : MILESTONE_STATUS_MAP[m.status]?.label}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm"><Link href={`/cliente/projetos/${project.id}`}>Ver detalhes do projeto</Link></Button>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader title="Pagamentos em aberto" action={<Link href="/cliente/pagamentos" className="text-[13px] text-accent hover:underline">Todos</Link>} />
            {payments.length === 0 ? <p className="px-5 pb-5 text-[13px] text-foreground-dim">Nenhum pagamento pendente.</p> : (
              <ul className="divide-y divide-border border-t border-border">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0"><p className="truncate text-sm">{PAYMENT_TYPE_MAP[p.type] ?? p.description}</p><p className="text-xs text-foreground-dim">{p.dueDate ? `Vence ${formatDate(p.dueDate)}` : "Vencimento a definir"}</p></div>
                    <div className="text-right"><p className="text-sm num">{formatCurrency(p.amount)}</p><Badge tone={PAYMENT_STATUS_MAP[p.status]?.tone}>{PAYMENT_STATUS_MAP[p.status]?.label}</Badge></div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <CardHeader title="Atividade recente" action={<Link href="/cliente/notificacoes" className="text-[13px] text-accent hover:underline">Notificações</Link>} />
            {notifications.length === 0 && (project?.updates.length ?? 0) === 0 ? (
              <EmptyState icon={Bell} title="Sem novidades" className="py-8" />
            ) : (
              <ul className="divide-y divide-border border-t border-border">
                {project?.updates.map((u) => (
                  <li key={u.id} className="px-5 py-3"><p className="text-sm">{u.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">{u.message}</p><p className="mt-1 text-2xs text-foreground-dim">{formatDateTime(u.createdAt)}</p></li>
                ))}
                {notifications.map((n) => (
                  <li key={n.id} className="px-5 py-3"><p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">{n.message}</p></li>
                ))}
              </ul>
            )}
          </Card>
          <div className="grid grid-cols-2 gap-2">
            {[{ href: "/cliente/contratos", label: "Contratos", icon: FileSignature }, { href: "/cliente/apresentacoes", label: "Apresentações", icon: Presentation }, { href: "/cliente/briefing", label: "Briefing", icon: ClipboardList }, { href: "/cliente/mensalidades", label: "Mensalidades", icon: Wallet }].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground">
                <l.icon className="h-4 w-4" strokeWidth={1.6} />{l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
