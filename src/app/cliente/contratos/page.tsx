import Link from "next/link";
import { ArrowUpRight, FileSignature } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteContratosPage() {
  const { clientId } = await requireClient();
  const contracts = await prisma.contract.findMany({
    where: { clientId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, status: true, version: true, value: true, deadline: true, signedAt: true, sentAt: true, supersededAt: true },
  });
  const pendingCount = contracts.filter((c) => c.status === "SENT" || c.status === "VIEWED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documentos"
        title="Contratos"
        description={pendingCount ? `${pendingCount} contrato(s) aguardando sua assinatura.` : "Contratos enviados pela Unitrix para leitura e assinatura eletrônica."}
      />
      {contracts.length === 0 ? (
        <Card>
          <EmptyState icon={FileSignature} title="Nenhum contrato disponível" description="Quando a Unitrix enviar um contrato, ele aparecerá aqui para leitura e assinatura." />
        </Card>
      ) : (
        <ul className="space-y-3">
          {contracts.map((c) => {
            const actionable = c.status === "SENT" || c.status === "VIEWED";
            return (
              <li key={c.id}>
                <Link
                  href={`/contrato/${c.slug}`}
                  className="group flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DocStatusBadge kind="contract" status={c.status} />
                      <span className="num text-xs text-foreground-dim">v{c.version}</span>
                    </div>
                    <p className="mt-2 truncate text-[15px] font-medium text-foreground">{c.title}</p>
                    <p className="mt-1 text-[13px] text-foreground-muted">
                      <span className="num">{formatCurrency(c.value)}</span> · prazo {formatDate(c.deadline)}
                      {c.signedAt && <> · assinado em {formatDate(c.signedAt)}</>}
                    </p>
                  </div>
                  <span className={actionable ? "inline-flex items-center gap-1.5 text-sm font-medium text-accent" : "inline-flex items-center gap-1.5 text-sm text-foreground-muted group-hover:text-foreground"}>
                    {actionable ? "Ler e assinar" : "Ver documento"} <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
