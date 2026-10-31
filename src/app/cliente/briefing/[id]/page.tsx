import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { BRIEFING_EDITABLE } from "@/lib/briefing/schema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/states";
import { BriefingView } from "@/components/documents/briefing-view";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatDate, formatDateTime, serialize } from "@/lib/utils";
import { BriefingWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function ClienteBriefingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { clientId } = await requireClient();
  const { id } = await params;
  const b = await prisma.briefing.findFirst({
    where: { id, clientId },
    include: { files: { orderBy: { createdAt: "asc" } }, project: { select: { title: true } } },
  });
  if (!b) notFound();
  const editable = BRIEFING_EDITABLE.includes(b.status);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/cliente/briefing"><ArrowLeft strokeWidth={1.6} /> Briefings</Link>
      </Button>
      <PageHeader eyebrow={b.project ? b.project.title : "Briefing"} title={b.title} />
      <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
        <DocStatusBadge kind="briefing" status={b.status} />
        {b.submittedAt && <span>Enviado em {formatDateTime(b.submittedAt)}</span>}
        {b.status === "APPROVED" && b.reviewedAt && <span>Aprovado em {formatDate(b.reviewedAt)}</span>}
      </div>

      {b.status === "REVISION_REQUESTED" && b.revisionNote && (
        <div className="rounded-lg border border-warning/30 bg-warning/[0.07] p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-warning"><AlertTriangle className="h-4 w-4" strokeWidth={1.6} /> Ajustes solicitados pela Unitrix</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{b.revisionNote}</p>
          {b.revisionRequestedAt && <p className="mt-2 text-xs text-foreground-dim">{formatDateTime(b.revisionRequestedAt)}</p>}
        </div>
      )}

      {editable ? (
        <BriefingWizard briefing={serialize(b)} />
      ) : (
        <>
          <p className="text-sm text-foreground-muted">
            {b.status === "SUBMITTED" ? "Seu briefing está em análise pela equipe Unitrix. Você será notificado sobre a avaliação." : "Briefing aprovado. Ele orienta a proposta e o escopo do projeto."}
          </p>
          <BriefingView briefing={serialize(b)} />
        </>
      )}
    </div>
  );
}
