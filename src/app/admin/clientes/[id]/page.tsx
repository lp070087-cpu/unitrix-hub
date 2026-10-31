import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, FolderKanban, FileSignature, Presentation, Wallet, Repeat, ClipboardList, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/states";
import {
  BRIEFING_STATUS_MAP, CLIENT_STATUS_MAP, CONTRACT_STATUS_MAP, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, PRESENTATION_STATUS_MAP,
  PROJECT_STATUS_MAP, SUBSCRIPTION_STATUS_MAP, formatCurrency, formatDate, toNumber,
} from "@/lib/utils";
import { ClientActions } from "./client-actions";

export const metadata = { title: "Cliente" };

function Row({ href, title, meta, badge }: { href: string; title: string; meta?: string; badge?: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-hover/50">
        <div className="min-w-0">
          <p className="truncate text-sm">{title}</p>
          {meta && <p className="truncate text-xs text-foreground-dim">{meta}</p>}
        </div>
        {badge}
      </Link>
    </li>
  );
}

function Section({ icon: Icon, title, href, cta, empty, children, count }: { icon: any; title: string; href: string; cta: string; empty: string; children: React.ReactNode; count: number }) {
  return (
    <Card>
      <CardHeader
        title={<span className="flex items-center gap-2"><Icon className="h-4 w-4 text-foreground-dim" strokeWidth={1.6} />{title}</span>}
        action={<Link href={href} className="text-[13px] text-accent hover:underline">{cta}</Link>}
      />
      {count === 0 ? <p className="px-5 pb-5 text-[13px] text-foreground-dim">{empty}</p> : <ul className="divide-y divide-border border-t border-border">{children}</ul>}
    </Card>
  );
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" }, take: 6 },
      presentations: { orderBy: { createdAt: "desc" }, take: 6 },
      briefings: { orderBy: { createdAt: "desc" }, take: 6 },
      payments: { orderBy: { createdAt: "desc" }, take: 8 },
      subscriptions: { include: { plan: true }, orderBy: { startedAt: "desc" } },
    },
  });
  if (!c) notFound();

  const paid = c.payments.filter((p) => p.status === "PAID").reduce((a, p) => a + toNumber(p.amount), 0);
  const open = c.payments.filter((p) => p.status === "PENDING" || p.status === "OVERDUE").reduce((a, p) => a + toNumber(p.amount), 0);
  const s = CLIENT_STATUS_MAP[c.status];
  const q = `?cliente=${c.id}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/clientes" className="inline-flex items-center gap-1.5 text-[13px] text-foreground-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Clientes</Link>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">{c.name}</h1>
            <Badge tone={s?.tone}>{s?.label ?? c.status}</Badge>
            {c.passwordHash ? <Badge tone="success" dot>Portal ativo</Badge> : <Badge>Sem acesso ao portal</Badge>}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-foreground-muted">
            {c.company && <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{c.company}</span>}
            <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground"><Mail className="h-3.5 w-3.5" />{c.email}</a>
            {c.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.phone}</span>}
            {c.city && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{c.city}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link href={`/admin/clientes/${c.id}/editar`}><Pencil /> Editar</Link></Button>
          <ClientActions id={c.id} status={c.status} hasAccess={!!c.passwordHash} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5"><p className="eyebrow">Recebido</p><p className="mt-2 text-xl font-semibold num">{formatCurrency(paid)}</p></Card>
        <Card className="p-5"><p className="eyebrow">Em aberto</p><p className="mt-2 text-xl font-semibold num">{formatCurrency(open)}</p></Card>
        <Card className="p-5"><p className="eyebrow">Cliente desde</p><p className="mt-2 text-xl font-semibold">{formatDate(c.createdAt)}</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={FolderKanban} title="Projetos" href={`/admin/projetos${q}`} cta="Gerenciar" empty="Nenhum projeto." count={c.projects.length}>
          {c.projects.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/projetos/${p.id}`} className="block px-5 py-3 hover:bg-surface-hover/50">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm">{p.title}</p>
                  <Badge tone={PROJECT_STATUS_MAP[p.status]?.tone}>{PROJECT_STATUS_MAP[p.status]?.label ?? p.status}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3"><Progress value={p.progress} /><span className="text-xs text-foreground-dim num">{p.progress}%</span></div>
              </Link>
            </li>
          ))}
        </Section>
        <Section icon={Wallet} title="Cobranças recentes" href={`/admin/financeiro${q}`} cta="Financeiro" empty="Nenhuma cobrança." count={c.payments.length}>
          {c.payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{p.description}</p>
                <p className="text-xs text-foreground-dim">{PAYMENT_TYPE_MAP[p.type] ?? p.type} · {p.paidAt ? `pago em ${formatDate(p.paidAt)}` : p.dueDate ? `vence ${formatDate(p.dueDate)}` : "sem vencimento"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm num">{formatCurrency(p.amount)}</p>
                <Badge tone={PAYMENT_STATUS_MAP[p.status]?.tone}>{PAYMENT_STATUS_MAP[p.status]?.label ?? p.status}</Badge>
              </div>
            </li>
          ))}
        </Section>
        <Section icon={FileSignature} title="Contratos" href={`/admin/contratos/novo?clientId=${c.id}`} cta="Novo contrato" empty="Nenhum contrato." count={c.contracts.length}>
          {c.contracts.map((k) => <Row key={k.id} href={`/admin/contratos/${k.id}`} title={k.title} meta={`v${k.version} · ${formatCurrency(k.value)}`} badge={<Badge tone={CONTRACT_STATUS_MAP[k.status]?.tone}>{CONTRACT_STATUS_MAP[k.status]?.label ?? k.status}</Badge>} />)}
        </Section>
        <Section icon={Presentation} title="Apresentações" href="/admin/apresentacoes" cta="Apresentações" empty="Nenhuma apresentação." count={c.presentations.length}>
          {c.presentations.map((k) => <Row key={k.id} href={`/admin/apresentacoes/${k.id}`} title={k.title} meta={formatDate(k.createdAt)} badge={<Badge tone={PRESENTATION_STATUS_MAP[k.status]?.tone}>{PRESENTATION_STATUS_MAP[k.status]?.label ?? k.status}</Badge>} />)}
        </Section>
        <Section icon={ClipboardList} title="Briefings" href="/admin/briefings" cta="Briefings" empty="Nenhum briefing." count={c.briefings.length}>
          {c.briefings.map((k) => <Row key={k.id} href={`/admin/briefings/${k.id}`} title={k.title} meta={formatDate(k.updatedAt)} badge={<Badge tone={BRIEFING_STATUS_MAP[k.status]?.tone}>{BRIEFING_STATUS_MAP[k.status]?.label ?? k.status}</Badge>} />)}
        </Section>
        <Section icon={Repeat} title="Assinaturas" href="/admin/assinaturas" cta="Assinaturas" empty="Nenhuma assinatura." count={c.subscriptions.length}>
          {c.subscriptions.map((k) => <Row key={k.id} href="/admin/assinaturas" title={k.plan.name} meta={`Próx. cobrança ${formatDate(k.nextBilling)}`} badge={<Badge tone={SUBSCRIPTION_STATUS_MAP[k.status]?.tone}>{SUBSCRIPTION_STATUS_MAP[k.status]?.label ?? k.status}</Badge>} />)}
        </Section>
      </div>
    </div>
  );
}
