import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/states";
import { BriefingView } from "@/components/documents/briefing-view";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatDateTime, serialize } from "@/lib/utils";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function AdminBriefingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await prisma.briefing.findUnique({
    where: { id },
    include: { files: { orderBy: { createdAt: "asc" } }, client: { select: { id: true, name: true, company: true, email: true } }, project: { select: { id: true, title: true } } },
  });
  if (!b) notFound();
  const projects = await prisma.project.findMany({
    where: { clientId: b.clientId, OR: [{ briefing: null }, { briefing: { id: b.id } }] },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/briefings"><ArrowLeft strokeWidth={1.6} /> Briefings</Link>
      </Button>
      <PageHeader eyebrow={b.client.company || b.client.name} title={b.title} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-muted">
        <DocStatusBadge kind="briefing" status={b.status} />
        <span>Enviado: {formatDateTime(b.submittedAt)}</span>
        <span>Revisado: {formatDateTime(b.reviewedAt)}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 order-2 xl:order-1">
          <BriefingView briefing={serialize(b)} />
        </div>
        <aside className="order-1 space-y-4 xl:order-2 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardHeader title="Revisão" />
            <CardBody>
              <ReviewActions id={b.id} status={b.status} projectId={b.projectId} projects={projects} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Cliente" />
            <CardBody className="space-y-1 text-sm">
              <Link href={`/admin/clientes/${b.client.id}`} className="font-medium hover:text-accent">{b.client.name}</Link>
              <p className="break-all text-foreground-muted">{b.client.email}</p>
              {b.project && <p className="pt-2 text-foreground-muted">Projeto: <Link href={`/admin/projetos/${b.project.id}`} className="text-foreground hover:text-accent">{b.project.title}</Link></p>}
            </CardBody>
          </Card>
          {b.revisionNote && (
            <Card>
              <CardHeader title="Última solicitação de ajustes" description={formatDateTime(b.revisionRequestedAt)} />
              <CardBody><p className="whitespace-pre-line text-sm text-foreground-muted">{b.revisionNote}</p></CardBody>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
