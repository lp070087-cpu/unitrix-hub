import "server-only";
import { prisma } from "@/lib/prisma";

/** Progresso = etapas concluídas / total (0 quando não há etapas). */
export async function recalcProjectProgress(projectId: string) {
  const [total, done] = await Promise.all([
    prisma.projectMilestone.count({ where: { projectId } }),
    prisma.projectMilestone.count({ where: { projectId, status: "COMPLETED" } }),
  ]);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  await prisma.project.update({ where: { id: projectId }, data: { progress } });
  return progress;
}
