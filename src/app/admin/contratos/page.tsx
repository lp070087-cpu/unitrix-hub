import Link from "next/link";
import { FileSignature, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminContratosPage() {
  await requireAdmin();
  const contracts = await prisma.contract.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, status: true, version: true, value: true, signedAt: true, updatedAt: true, deadline: true,
      supersededAt: true, clientName: true, clientCompany: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documentos"
        title="Contratos"
        description="Contratos gerados a partir do Contrato Mestre Unitrix, com versões, linha do tempo e assinatura eletrônica."
        actions={
          <Button asChild variant="accent">
            <Link href="/admin/contratos/novo"><Plus strokeWidth={1.6} /> Novo contrato</Link>
          </Button>
        }
      />

      {contracts.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileSignature}
            title="Nenhum contrato ainda"
            description="Crie o primeiro contrato a partir de um cliente e, opcionalmente, de um projeto existente."
            action={<Button asChild size="sm"><Link href="/admin/contratos/novo">Novo contrato</Link></Button>}
          />
        </Card>
      ) : (
        <>
          {/* Mobile: lista */}
          <ul className="space-y-3 md:hidden">
            {contracts.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/contratos/${c.id}`} className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.title}</p>
                      <p className="mt-0.5 truncate text-[13px] text-foreground-muted">{c.clientCompany || c.clientName}</p>
                    </div>
                    <DocStatusBadge kind="contract" status={c.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-muted">
                    <span className="num text-foreground">{formatCurrency(c.value)}</span>
                    <span className="num">v{c.version}</span>
                    <span>{c.signedAt ? `Assinado em ${formatDate(c.signedAt)}` : "Não assinado"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: tabela */}
          <Card className="hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH>Contrato</TH>
                  <TH>Cliente</TH>
                  <TH>Versão</TH>
                  <TH className="text-right">Valor</TH>
                  <TH>Status</TH>
                  <TH>Assinatura</TH>
                  <TH>Atualizado</TH>
                </tr>
              </THead>
              <TBody>
                {contracts.map((c) => (
                  <TR key={c.id}>
                    <TD className="max-w-[280px]">
                      <Link href={`/admin/contratos/${c.id}`} className="block truncate font-medium hover:text-accent">{c.title}</Link>
                      <span className="text-xs text-foreground-dim">Prazo {formatDate(c.deadline)}</span>
                    </TD>
                    <TD className="max-w-[200px] truncate text-foreground-muted">{c.clientCompany || c.clientName}</TD>
                    <TD className="num text-foreground-muted">v{c.version}{c.supersededAt && c.status === "SIGNED" ? " · aditado" : ""}</TD>
                    <TD className="num text-right">{formatCurrency(c.value)}</TD>
                    <TD><DocStatusBadge kind="contract" status={c.status} /></TD>
                    <TD className="text-foreground-muted">{c.signedAt ? formatDate(c.signedAt) : "—"}</TD>
                    <TD className="text-foreground-muted">{formatDate(c.updatedAt)}</TD>
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
