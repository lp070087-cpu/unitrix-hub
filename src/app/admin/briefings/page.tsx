import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { BRIEFING_STATUS_MAP, cn, formatDate } from "@/lib/utils";
import { AdminNewBriefingDialog } from "./new-briefing-dialog";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "SUBMITTED", "REVISION_REQUESTED", "DRAFT", "APPROVED"] as const;

export default async function AdminBriefingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as (typeof FILTERS)[number]) ? (sp.status as (typeof FILTERS)[number]) : "ALL";

  const [briefings, counts, clients] = await Promise.all([
    prisma.briefing.findMany({
      where: status === "ALL" ? {} : { status },
      orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
      select: { id: true, title: true, status: true, submittedAt: true, updatedAt: true, client: { select: { name: true, company: true } }, project: { select: { title: true } } },
    }),
    prisma.briefing.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true, projects: { where: { briefing: null }, select: { id: true, title: true } } } }),
  ]);
  const countOf = (s: string) => (s === "ALL" ? counts.reduce((a, c) => a + c._count._all, 0) : counts.find((c) => c.status === s)?._count._all ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operação" title="Briefings" description="Briefings preenchidos pelos clientes. Revise, aprove ou solicite ajustes." actions={<AdminNewBriefingDialog clients={clients} />} />

      <nav aria-label="Filtrar por status" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/admin/briefings" : `/admin/briefings?status=${f}`}
            className={cn("inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-[13px] transition-colors", status === f ? "border-accent/40 bg-accent/10 text-foreground" : "border-border text-foreground-muted hover:text-foreground")}
            aria-current={status === f ? "page" : undefined}
          >
            {f === "ALL" ? "Todos" : BRIEFING_STATUS_MAP[f].label}
            <span className="num text-xs text-foreground-dim">{countOf(f)}</span>
          </Link>
        ))}
      </nav>

      {briefings.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title={status === "ALL" ? "Nenhum briefing" : "Nada neste filtro"} description={status === "ALL" ? "Clientes podem criar briefings no portal, ou você pode criar um rascunho para eles." : "Nenhum briefing com este status."} />
        </Card>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {briefings.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/briefings/${b.id}`} className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium">{b.title}</p>
                    <DocStatusBadge kind="briefing" status={b.status} />
                  </div>
                  <p className="mt-1 truncate text-[13px] text-foreground-muted">{b.client.company || b.client.name}</p>
                  <p className="mt-2 text-xs text-foreground-dim">{b.submittedAt ? `Enviado ${formatDate(b.submittedAt)}` : `Atualizado ${formatDate(b.updatedAt)}`}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Card className="hidden md:block">
            <Table>
              <THead><tr><TH>Briefing</TH><TH>Cliente</TH><TH>Projeto</TH><TH>Status</TH><TH>Enviado</TH><TH>Atualizado</TH></tr></THead>
              <TBody>
                {briefings.map((b) => (
                  <TR key={b.id}>
                    <TD className="max-w-[280px]"><Link href={`/admin/briefings/${b.id}`} className="block truncate font-medium hover:text-accent">{b.title}</Link></TD>
                    <TD className="max-w-[200px] truncate text-foreground-muted">{b.client.company || b.client.name}</TD>
                    <TD className="max-w-[200px] truncate text-foreground-muted">{b.project?.title ?? "—"}</TD>
                    <TD><DocStatusBadge kind="briefing" status={b.status} /></TD>
                    <TD className="text-foreground-muted">{formatDate(b.submittedAt)}</TD>
                    <TD className="text-foreground-muted">{formatDate(b.updatedAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
