import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { readSnapshot } from "@/lib/contracts/master";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/states";
import { ContractDocument } from "@/components/documents/contract-document";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { ContractActions } from "./contract-actions";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  CREATED: "Contrato gerado", UPDATED: "Rascunho editado", SENT: "Enviado ao cliente", RESENT: "Aviso reenviado",
  VIEWED: "Visualizado pelo cliente", READ_CONFIRMED: "Leitura confirmada", SIGNED: "Assinado eletronicamente",
  VERSIONED: "Nova versão criada", CANCELLED: "Cancelado",
};

type ChainItem = { id: string; version: number; status: string; createdAt: Date; signedAt: Date | null };

async function versionChain(id: string): Promise<ChainItem[]> {
  const sel = { id: true, version: true, status: true, createdAt: true, signedAt: true, previousVersionId: true } as const;
  const chain: ChainItem[] = [];
  const self = await prisma.contract.findUnique({ where: { id }, select: sel });
  if (!self) return chain;
  chain.push(self);
  let prevId = self.previousVersionId;
  for (let i = 0; prevId && i < 50; i++) {
    const p: { id: string; version: number; status: string; createdAt: Date; signedAt: Date | null; previousVersionId: string | null } | null =
      await prisma.contract.findUnique({ where: { id: prevId }, select: sel });
    if (!p) break;
    chain.unshift(p);
    prevId = p.previousVersionId;
  }
  let cursor = self.id;
  for (let i = 0; i < 50; i++) {
    const n = await prisma.contract.findFirst({ where: { previousVersionId: cursor }, select: sel });
    if (!n) break;
    chain.push(n);
    cursor = n.id;
  }
  return chain;
}

export default async function AdminContratoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const c = await prisma.contract.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: "desc" } },
      client: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      nextVersion: { select: { id: true } },
    },
  });
  if (!c) notFound();
  const [chain, snapshot] = [await versionChain(c.id), readSnapshot(c.contentSnapshot)];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/contratos"><ArrowLeft strokeWidth={1.6} /> Contratos</Link>
      </Button>
      <PageHeader eyebrow={`Contrato · versão ${c.version}`} title={c.title} description={`${c.clientCompany || c.clientName} · ${formatCurrency(c.value)} · prazo ${formatDate(c.deadline)}`} />
      <div className="flex flex-wrap items-center gap-3">
        <DocStatusBadge kind="contract" status={c.status} />
        {c.supersededAt && <span className="text-xs text-foreground-muted">Substituído/aditado em {formatDate(c.supersededAt)}</span>}
      </div>
      <ContractActions id={c.id} slug={c.slug} status={c.status} hasNext={!!c.nextVersion} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {snapshot ? (
            <ContractDocument snapshot={snapshot} evidence={c.signedAt ? { ...c, version: c.version } : null} />
          ) : (
            <Card><CardBody className="flex items-center gap-3 pt-5 text-sm text-foreground-muted"><AlertTriangle className="h-4 w-4 text-warning" strokeWidth={1.6} /> Este contrato não possui documento gerado (registro legado).</CardBody></Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Resumo" />
            <CardBody>
              <dl className="space-y-3 text-sm">
                <Row k="Cliente"><Link href={`/admin/clientes/${c.client.id}`} className="hover:text-accent">{c.client.name}</Link></Row>
                <Row k="Projeto">{c.project ? <Link href={`/admin/projetos/${c.project.id}`} className="hover:text-accent">{c.project.title}</Link> : "—"}</Row>
                <Row k="Enviado">{formatDateTime(c.sentAt)}</Row>
                <Row k="Visualizado">{formatDateTime(c.viewedAt)}</Row>
                <Row k="Assinado">{formatDateTime(c.signedAt)}</Row>
                {c.signedAt && <Row k="Signatário">{c.signerName}</Row>}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Versões" description="Cadeia de versões deste contrato." />
            <CardBody>
              <ol className="space-y-2">
                {chain.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/admin/contratos/${v.id}`}
                      className={cn("flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors", v.id === c.id ? "border-accent/40 bg-accent/5" : "border-border hover:border-border-strong")}
                      aria-current={v.id === c.id ? "page" : undefined}
                    >
                      <span className="num">v{v.version}</span>
                      <span className="text-xs text-foreground-muted">{formatDate(v.createdAt)}</span>
                      <DocStatusBadge kind="contract" status={v.status} />
                    </Link>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Linha do tempo" description="Eventos registrados (auditoria)." />
            <CardBody>
              {c.events.length === 0 ? (
                <p className="text-sm text-foreground-muted">Nenhum evento registrado.</p>
              ) : (
                <ol className="relative space-y-5 border-l border-border pl-5">
                  {c.events.map((e) => (
                    <li key={e.id} className="relative">
                      <span className={cn("absolute -left-[25px] top-1.5 h-2 w-2 rounded-full", e.action === "SIGNED" ? "bg-success" : e.action === "CANCELLED" ? "bg-danger" : "bg-foreground-dim")} />
                      <p className="text-sm font-medium text-foreground">{EVENT_LABEL[e.action] ?? e.action}</p>
                      <p className="num mt-0.5 text-xs text-foreground-muted">{formatDateTime(e.createdAt)}</p>
                      {(e.actor || e.ip) && (
                        <p className="mt-0.5 break-all text-xs text-foreground-dim">{[e.actor, e.ip && `IP ${e.ip}`].filter(Boolean).join(" · ")}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-foreground-muted">{k}</dt>
      <dd className="min-w-0 text-right text-foreground break-words">{children}</dd>
    </div>
  );
}
