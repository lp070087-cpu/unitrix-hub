import Link from "next/link";
import { ArrowUpRight, Presentation as PresentationIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteApresentacoesPage() {
  const { clientId } = await requireClient();
  const items = await prisma.presentation.findMany({
    where: { clientId, status: { in: ["SENT", "VIEWED", "ACCEPTED"] } },
    orderBy: { sentAt: "desc" },
    select: { id: true, slug: true, title: true, status: true, sentAt: true, acceptedAt: true, project: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Documentos" title="Apresentações" description="Propostas preparadas pela Unitrix para você." />
      {items.length === 0 ? (
        <Card>
          <EmptyState icon={PresentationIcon} title="Nenhuma apresentação recebida" description="Quando a Unitrix enviar uma proposta, ela aparecerá aqui." />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/apresentacao/${p.slug}`} className="group flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                <div className="flex items-center justify-between gap-3">
                  <DocStatusBadge kind="presentation" status={p.status} />
                  <ArrowUpRight className="h-4 w-4 text-foreground-dim transition-colors group-hover:text-accent" strokeWidth={1.6} />
                </div>
                <p className="mt-4 text-[17px] font-medium leading-snug text-foreground">{p.title}</p>
                {p.project && <p className="mt-1 text-[13px] text-foreground-muted">{p.project.title}</p>}
                <p className="mt-auto pt-4 text-xs text-foreground-dim">
                  {p.acceptedAt ? `Aprovada em ${formatDate(p.acceptedAt)}` : `Recebida em ${formatDate(p.sentAt)}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
