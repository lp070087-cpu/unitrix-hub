import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { serialize } from "@/lib/utils";
import { PageHeader } from "@/components/ui/states";
import { ProjectsBoard } from "./projects-board";
import { NewProjectDialog } from "./new-project-dialog";

export const dynamic = "force-dynamic";

export default async function AdminProjetosPage() {
  await requireAdmin();
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true, title: true, status: true, progress: true, startDate: true, endDate: true, totalValue: true, stageChangedAt: true, updatedAt: true,
        client: { select: { id: true, name: true, company: true } },
        delivery: { select: { status: true } },
        payments: { where: { type: { in: ["DEPOSIT", "FINAL_BALANCE"] }, status: { not: "CANCELLED" } }, select: { status: true } },
        _count: { select: { milestones: true } },
      },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Projetos"
        description="Pipeline de produção, prazos e liberação de entregas."
        actions={<NewProjectDialog clients={serialize(clients)} />}
      />
      <ProjectsBoard projects={serialize(projects)} clients={serialize(clients)} />
    </div>
  );
}
