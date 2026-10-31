"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Columns3, FolderKanban, List, Lock, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, Progress } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, DELIVERY_STATUS_MAP, formatCurrency, PROJECT_PIPELINE, PROJECT_STATUS_MAP } from "@/lib/utils";
import { formatDay } from "@/lib/billing/format";

type Project = {
  id: string; title: string; status: string; progress: number; startDate: string | null; endDate: string | null;
  totalValue: string | null; updatedAt: string;
  client: { id: string; name: string; company: string | null };
  delivery: { status: string } | null;
  payments: { status: string }[];
  _count: { milestones: number };
};

const VIEW_KEY = "unitrix:projetos:view";

function paidLabel(p: Project) {
  if (!p.payments.length) return null;
  const paid = p.payments.filter((x) => x.status === "PAID").length;
  return { paid, total: p.payments.length, overdue: p.payments.some((x) => x.status === "OVERDUE") };
}

function isLate(p: Project) {
  return !!p.endDate && new Date(p.endDate).getTime() + 86_400_000 < Date.now() && !["COMPLETED", "DELIVERED", "CANCELLED"].includes(p.status);
}

export function ProjectsBoard({ projects, clients }: { projects: Project[]; clients: { id: string; name: string }[] }) {
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [clientId, setClientId] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "list" || v === "board") setView(v);
    } catch {}
  }, []);
  const changeView = (v: "board" | "list") => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter((p) =>
      (!clientId || p.client.id === clientId) &&
      (!term || p.title.toLowerCase().includes(term) || p.client.name.toLowerCase().includes(term) || (p.client.company ?? "").toLowerCase().includes(term))
    );
  }, [projects, q, clientId]);

  const offPipeline = filtered.filter((p) => !(PROJECT_PIPELINE as readonly string[]).includes(p.status));

  if (projects.length === 0) {
    return (
      <Card>
        <EmptyState icon={FolderKanban} title="Nenhum projeto ainda" description="Crie o primeiro projeto para acompanhar etapas, prazos, cobranças e entrega." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-dim" strokeWidth={1.5} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar projeto ou cliente" className="pl-9" aria-label="Buscar" />
        </div>
        <Select value={clientId} onChange={(e) => setClientId(e.target.value)} className="sm:w-56" aria-label="Filtrar por cliente">
          <option value="">Todos os clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div className="inline-flex shrink-0 rounded-md border border-border bg-surface-sunken p-0.5" role="tablist" aria-label="Visualização">
          {([["board", Columns3, "Pipeline"], ["list", List, "Lista"]] as const).map(([v, Icon, label]) => (
            <button
              key={v} type="button" role="tab" aria-selected={view === v} onClick={() => changeView(v)}
              className={cn("inline-flex h-8 items-center gap-1.5 rounded px-3 text-[13px] transition-colors", view === v ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground")}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />{label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Search} title="Nada encontrado" description="Ajuste a busca ou o filtro de cliente." /></Card>
      ) : view === "board" ? (
        <>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex snap-x snap-mandatory gap-3 sm:snap-none">
              {PROJECT_PIPELINE.map((status) => {
                const items = filtered.filter((p) => p.status === status);
                return (
                  <section key={status} className="w-[80vw] max-w-[300px] shrink-0 snap-start sm:w-[272px]">
                    <header className="mb-2 flex items-center justify-between px-1">
                      <span className="eyebrow">{PROJECT_STATUS_MAP[status].label}</span>
                      <span className="num text-2xs text-foreground-dim">{items.length}</span>
                    </header>
                    <div className="min-h-[120px] space-y-2 rounded-lg border border-dashed border-border/70 bg-surface-sunken/40 p-2">
                      {items.length === 0 ? (
                        <p className="px-2 py-6 text-center text-xs text-foreground-dim">Sem projetos</p>
                      ) : items.map((p) => <ProjectCard key={p.id} p={p} />)}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
          {offPipeline.length > 0 && (
            <div>
              <button type="button" onClick={() => setShowClosed((s) => !s)} className="eyebrow hover:text-foreground-muted">
                {showClosed ? "Ocultar" : "Mostrar"} pausados e cancelados ({offPipeline.length})
              </button>
              {showClosed && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{offPipeline.map((p) => <ProjectCard key={p.id} p={p} showStatus />)}</div>
              )}
            </div>
          )}
        </>
      ) : (
        <ProjectsList projects={filtered} />
      )}
    </div>
  );
}

function ProjectCard({ p, showStatus }: { p: Project; showStatus?: boolean }) {
  const pay = paidLabel(p);
  const late = isLate(p);
  return (
    <Link href={`/admin/projetos/${p.id}`} className="group block rounded-md border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{p.title}</p>
        {showStatus && <StatusBadge map={PROJECT_STATUS_MAP} status={p.status} />}
      </div>
      <p className="mt-0.5 truncate text-xs text-foreground-muted">{p.client.company || p.client.name}</p>
      <div className="mt-3 flex items-center gap-2">
        <Progress value={p.progress} className="h-1" />
        <span className="num w-8 text-right text-2xs text-foreground-dim">{p.progress}%</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-foreground-dim">
        <span className={cn("num", late && "text-danger")}>{p.endDate ? `Entrega ${formatDay(p.endDate, { day: "2-digit", month: "short", year: undefined })}` : "Sem prazo"}</span>
        {pay && <span className={cn("num", pay.overdue ? "text-danger" : pay.paid === pay.total ? "text-success" : "")}>{pay.paid}/{pay.total} pagos</span>}
        {p.delivery?.status === "BLOCKED" && pay && pay.paid < pay.total && <Lock className="h-3 w-3" strokeWidth={1.6} aria-label="Entrega bloqueada" />}
      </div>
    </Link>
  );
}

function ProjectsList({ projects }: { projects: Project[] }) {
  return (
    <>
      <div className="space-y-2 md:hidden">
        {projects.map((p) => <ProjectCard key={p.id} p={p} showStatus />)}
      </div>
      <Card className="hidden md:block">
        <Table>
          <THead>
            <TR><TH>Projeto</TH><TH>Status</TH><TH>Progresso</TH><TH>Entrega</TH><TH className="text-right">Valor</TH><TH>Pagamentos</TH><TH>Liberação</TH></TR>
          </THead>
          <TBody>
            {projects.map((p) => {
              const pay = paidLabel(p);
              return (
                <TR key={p.id}>
                  <TD className="max-w-[260px]">
                    <Link href={`/admin/projetos/${p.id}`} className="block truncate font-medium hover:text-accent">{p.title}</Link>
                    <span className="block truncate text-xs text-foreground-muted">{p.client.company || p.client.name}</span>
                  </TD>
                  <TD><StatusBadge map={PROJECT_STATUS_MAP} status={p.status} /></TD>
                  <TD className="w-40"><div className="flex items-center gap-2"><Progress value={p.progress} className="h-1" /><span className="num text-2xs text-foreground-dim">{p.progress}%</span></div></TD>
                  <TD className={cn("num text-[13px] whitespace-nowrap", isLate(p) ? "text-danger" : "text-foreground-muted")}>{formatDay(p.endDate)}</TD>
                  <TD className="num text-right text-[13px]">{p.totalValue ? formatCurrency(p.totalValue) : "—"}</TD>
                  <TD className="num text-[13px] text-foreground-muted">{pay ? `${pay.paid}/${pay.total}` : "—"}</TD>
                  <TD>{p.delivery ? <StatusBadge map={DELIVERY_STATUS_MAP} status={p.delivery.status} /> : <span className="text-foreground-dim">—</span>}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
