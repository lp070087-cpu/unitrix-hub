import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { serialize } from "@/lib/utils";
import { getDeliveryBlockers, parseCredentials } from "@/lib/projects/delivery";
import { ProjectHeader } from "./project-header";
import { MilestonesPanel } from "./milestones-panel";
import { UpdatesPanel } from "./updates-panel";
import { NotesPanel } from "./notes-panel";
import { FinancePanel } from "./finance-panel";
import { DeliveryPanel } from "./delivery-panel";

export const dynamic = "force-dynamic";

export default async function AdminProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      milestones: { orderBy: [{ order: "asc" }, { id: "asc" }] },
      updates: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] },
      delivery: true,
    },
  });
  if (!project) notFound();

  const blockers = await getDeliveryBlockers(project.id);
  const { delivery, payments, milestones, updates, internalNotes, ...rest } = project;

  return (
    <div className="space-y-6">
      <Link href="/admin/projetos" className="inline-flex items-center gap-1.5 text-[13px] text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />Projetos
      </Link>

      <ProjectHeader project={serialize({ ...rest, milestonesCount: milestones.length })} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <MilestonesPanel projectId={project.id} milestones={serialize(milestones)} />
          <UpdatesPanel projectId={project.id} updates={serialize(updates)} />
        </div>
        <div className="min-w-0 space-y-6">
          <FinancePanel project={serialize({ id: project.id, clientId: project.clientId, totalValue: project.totalValue })} payments={serialize(payments)} />
          <DeliveryPanel
            projectId={project.id}
            delivery={delivery ? serialize({ ...delivery, credentials: parseCredentials(delivery.credentials) }) : null}
            releasable={blockers.releasable}
            blockedReason={blockers.blockedReason}
          />
          <NotesPanel projectId={project.id} notes={internalNotes ?? ""} />
        </div>
      </div>
    </div>
  );
}
