import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { parsePresentationContent } from "@/lib/presentations/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/states";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatDateTime, serialize } from "@/lib/utils";
import { PresentationEditor } from "./editor";

export const dynamic = "force-dynamic";

export default async function AdminApresentacaoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.presentation.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, company: true, projects: { select: { id: true, title: true }, orderBy: { createdAt: "desc" } } } } },
  });
  if (!p) notFound();
  const content = parsePresentationContent(p.content, p.title);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/apresentacoes"><ArrowLeft strokeWidth={1.6} /> Apresentações</Link>
      </Button>
      <PageHeader eyebrow={p.client.company || p.client.name} title={p.title} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-muted">
        <DocStatusBadge kind="presentation" status={p.status} />
        <span>Enviada: {formatDateTime(p.sentAt)}</span>
        <span>Visualizada: {formatDateTime(p.viewedAt)}</span>
        {p.acceptedAt && <span className="text-success">Aprovada por {p.acceptedByName} em {formatDateTime(p.acceptedAt)} · IP {p.acceptedIp}</span>}
      </div>
      <PresentationEditor
        presentation={serialize({ id: p.id, slug: p.slug, title: p.title, status: p.status, projectId: p.projectId })}
        projects={p.client.projects}
        initialContent={content}
      />
    </div>
  );
}
