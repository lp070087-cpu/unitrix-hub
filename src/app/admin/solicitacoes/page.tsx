import Link from "next/link";
import { Inbox, Mail, MessageCircle, UserPlus, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { LEAD_STATUS_MAP, formatDateTime } from "@/lib/utils";
import { LeadControls } from "./lead-controls";

export const metadata = { title: "Solicitações" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((a, c) => a + c._count, 0);
  const tabs = [["", "Todas", total], ...Object.entries(LEAD_STATUS_MAP).map(([k, v]) => [k, v.label, countOf(k)])] as [string, string, number][];

  return (
    <div className="space-y-6">
      <PageHeader title="Solicitações comerciais" description="Pedidos de orçamento enviados pelo site. Nenhuma solicitação é descartada automaticamente." />

      <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Filtrar por status">
        {tabs.map(([k, label, n]) => (
          <Link key={k} href={k ? `?status=${k}` : "?"} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors ${status === k ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground"}`}>
            {label} <span className="ml-1 text-foreground-dim num">{n}</span>
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <Card><EmptyState icon={Inbox} title="Nenhuma solicitação" description="Quando alguém enviar o formulário de orçamento do site, a solicitação aparece aqui e você recebe uma notificação." /></Card>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => {
            const s = LEAD_STATUS_MAP[l.status];
            const wa = l.whatsapp.replace(/\D/g, "");
            return (
              <Card key={l.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold">{l.name}</h3>
                      {l.company && <span className="text-[13px] text-foreground-muted">· {l.company}</span>}
                      <Badge tone={s?.tone}>{s?.label ?? l.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-foreground-dim">{formatDateTime(l.createdAt)} · {l.projectType}{l.budgetRange ? ` · ${l.budgetRange}` : ""}</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground-muted">{l.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary"><a href={`mailto:${l.email}`}><Mail /> {l.email}</a></Button>
                      <Button asChild size="sm" variant="secondary"><a href={`https://wa.me/${wa.length <= 11 ? "55" + wa : wa}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> {l.whatsapp}</a></Button>
                      {l.convertedClientId ? (
                        <Button asChild size="sm" variant="ghost"><Link href={`/admin/clientes/${l.convertedClientId}`}>Ver cliente <ArrowUpRight /></Link></Button>
                      ) : (
                        <Button asChild size="sm" variant="ghost"><Link href={`/admin/clientes/novo?lead=${l.id}`}><UserPlus /> Converter em cliente</Link></Button>
                      )}
                    </div>
                  </div>
                  <LeadControls id={l.id} status={l.status} notes={l.notes ?? ""} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
