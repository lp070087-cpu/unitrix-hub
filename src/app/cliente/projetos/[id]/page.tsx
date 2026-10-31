import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Circle, CircleDot, KeyRound, ListChecks, Lock, MessageSquareText, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, Progress } from "@/components/ui/states";
import { CLIENT_DELIVERY_MAP, StatusBadge } from "@/components/shared/status-badge";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";
import { CredentialRow } from "@/components/shared/client-delivery";
import { parseCredentials } from "@/lib/projects/delivery";
import { formatDay } from "@/lib/billing/format";
import { cn, formatCurrency, formatDateTime, MILESTONE_STATUS_MAP, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, PROJECT_STATUS_MAP, toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { clientId } = await requireClient().catch(() => redirect("/auth/login?callbackUrl=/cliente/projetos"));
  const { id } = await params;

  // Ownership: filtro por clientId do token. Campos selecionados explicitamente (sem internalNotes).
  const project = await prisma.project.findFirst({
    where: { id, clientId },
    select: {
      id: true, title: true, description: true, status: true, progress: true, startDate: true, endDate: true, totalValue: true,
      milestones: { orderBy: [{ order: "asc" }, { id: "asc" }], select: { id: true, title: true, description: true, status: true, dueDate: true, completedAt: true } },
      updates: { where: { visible: true }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, message: true, createdAt: true } },
      payments: { where: { clientId, status: { not: "CANCELLED" } }, orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }], select: { id: true, description: true, type: true, amount: true, status: true, dueDate: true, paidAt: true } },
      delivery: { select: { status: true, link: true, documentation: true, notes: true, credentials: true, releasedAt: true } },
    },
  });
  if (!project) notFound();

  const released = project.delivery?.status === "RELEASED";
  const credentials = released ? parseCredentials(project.delivery?.credentials) : [];
  const done = project.status === "COMPLETED" || project.status === "DELIVERED";
  const paid = project.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + toNumber(p.amount), 0);
  const open = project.payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + toNumber(p.amount), 0);
  const completed = project.milestones.filter((m) => m.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <Link href="/cliente/projetos" className="inline-flex items-center gap-1.5 text-[13px] text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />Projetos
      </Link>

      <Card>
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <StatusBadge map={PROJECT_STATUS_MAP} status={project.status} />
            <h1 className="display mt-4 text-[34px] text-foreground sm:text-[44px]">{project.title}</h1>
            {project.description && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground-muted">{project.description}</p>}
          </div>
          <div className="space-y-5 rounded-lg border border-border bg-surface-sunken p-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Progresso</span>
                <span className="num text-xl font-semibold text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="mt-2.5" />
              {project.milestones.length > 0 && <p className="mt-2 text-2xs text-foreground-dim num">{completed} de {project.milestones.length} etapas concluídas</p>}
            </div>
            <TimelinePrazo startDate={project.startDate ? project.startDate.toISOString() : null} endDate={project.endDate ? project.endDate.toISOString() : null} completed={done} label="Prazo" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Etapas" description="Linha do tempo da produção." />
            <CardBody>
              {project.milestones.length === 0 ? (
                <EmptyState icon={ListChecks} title="Etapas em definição" description="A equipe publicará as etapas do projeto em breve." className="py-8" />
              ) : (
                <ol className="relative space-y-0">
                  {project.milestones.map((m, i) => {
                    const Icon = m.status === "COMPLETED" ? Check : m.status === "IN_PROGRESS" ? CircleDot : Circle;
                    const last = i === project.milestones.length - 1;
                    return (
                      <li key={m.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {!last && <span className={cn("absolute left-3 top-7 h-[calc(100%-1.5rem)] w-px", m.status === "COMPLETED" ? "bg-success/30" : "bg-border")} aria-hidden />}
                        <span className={cn(
                          "relative z-[1] grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                          m.status === "COMPLETED" ? "border-success/40 bg-success/15 text-success" : m.status === "IN_PROGRESS" ? "border-accent/40 bg-accent/10 text-accent" : "border-border-strong bg-surface text-foreground-dim"
                        )}>
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className={cn("text-sm", m.status === "COMPLETED" ? "text-foreground-muted" : "text-foreground")}>{m.title}</p>
                          {m.description && <p className="mt-0.5 text-[13px] text-foreground-muted">{m.description}</p>}
                          <p className="num mt-1 text-2xs text-foreground-dim">
                            <span className={MILESTONE_STATUS_MAP[m.status]?.color}>{MILESTONE_STATUS_MAP[m.status]?.label}</span>
                            {m.completedAt ? ` · ${formatDay(m.completedAt)}` : m.dueDate ? ` · previsão ${formatDay(m.dueDate)}` : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Atualizações" />
            <CardBody>
              {project.updates.length === 0 ? (
                <EmptyState icon={MessageSquareText} title="Sem atualizações ainda" description="Comunicados da equipe sobre o andamento aparecem aqui." className="py-8" />
              ) : (
                <ol className="space-y-5">
                  {project.updates.map((u) => (
                    <li key={u.id} className="border-l border-border pl-4">
                      <p className="num text-2xs text-foreground-dim">{formatDateTime(u.createdAt)}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{u.title}</p>
                      <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-foreground-muted">{u.message}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Entrega" action={<StatusBadge map={CLIENT_DELIVERY_MAP} status={released ? "RELEASED" : "PENDING"} />} />
            <CardBody className="space-y-4">
              {released && project.delivery ? (
                <>
                  <p className="text-[13px] text-foreground-muted">Liberada em <span className="num text-foreground">{formatDateTime(project.delivery.releasedAt)}</span>.</p>
                  {project.delivery.link && (
                    <Button asChild variant="accent" className="w-full">
                      <a href={project.delivery.link} target="_blank" rel="noopener noreferrer">Acessar entrega<ArrowUpRight /></a>
                    </Button>
                  )}
                  {project.delivery.documentation && (
                    <div>
                      <p className="eyebrow mb-2">Documentação</p>
                      <div className="whitespace-pre-line rounded-md border border-border bg-surface-sunken p-3 text-[13px] leading-relaxed text-foreground-muted">{project.delivery.documentation}</div>
                    </div>
                  )}
                  {credentials.length > 0 && (
                    <div>
                      <p className="eyebrow mb-2 inline-flex items-center gap-1.5"><KeyRound className="h-3 w-3" />Acessos</p>
                      <div className="divide-y divide-border rounded-md border border-border bg-surface-sunken">
                        {credentials.map((c, i) => <CredentialRow key={i} label={c.label} value={c.value} />)}
                      </div>
                      <p className="mt-2 text-2xs text-foreground-dim">Recomendamos alterar as senhas no primeiro acesso.</p>
                    </div>
                  )}
                  {project.delivery.notes && <p className="whitespace-pre-line text-[13px] text-foreground-muted">{project.delivery.notes}</p>}
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-md border border-border bg-surface-sunken p-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-foreground-dim" strokeWidth={1.6} />
                  <div>
                    <p className="text-[13px] text-foreground">Liberada após a quitação do saldo</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">Link, documentação e acessos ficam disponíveis aqui após a conclusão e a quitação.</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pagamentos do projeto" action={<Link href="/cliente/pagamentos" className="text-xs text-foreground-muted hover:text-foreground">Ver todos</Link>} />
            <CardBody className="space-y-3">
              {project.payments.length === 0 ? (
                <EmptyState icon={Receipt} title="Sem cobranças" className="py-6" />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
                    <div className="bg-surface-sunken p-3"><p className="eyebrow">Pago</p><p className="num mt-1 text-[15px] text-success">{formatCurrency(paid)}</p></div>
                    <div className="bg-surface-sunken p-3"><p className="eyebrow">Em aberto</p><p className="num mt-1 text-[15px] text-foreground">{formatCurrency(open)}</p></div>
                  </div>
                  <ul className="divide-y divide-border rounded-md border border-border">
                    {project.payments.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] text-foreground">{p.type === "EXTRA" ? p.description : PAYMENT_TYPE_MAP[p.type] ?? p.description}</p>
                          <p className="num mt-0.5 text-2xs text-foreground-dim">{p.status === "PAID" ? `Pago ${formatDay(p.paidAt)}` : p.dueDate ? `Vence ${formatDay(p.dueDate)}` : "Vencimento a definir"}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="num text-[13px]">{formatCurrency(p.amount)}</span>
                          <StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
