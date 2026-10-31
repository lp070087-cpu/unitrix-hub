import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader, Progress } from "@/components/ui/states";
import { CLIENT_DELIVERY_MAP, StatusBadge } from "@/components/shared/status-badge";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";
import { PROJECT_STATUS_MAP, serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteProjetosPage() {
  const { clientId } = await requireClient().catch(() => redirect("/auth/login?callbackUrl=/cliente/projetos"));
  const projects = await prisma.project.findMany({
    where: { clientId },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true, title: true, status: true, progress: true, startDate: true, endDate: true,
      delivery: { select: { status: true } },
      milestones: { where: { status: { not: "COMPLETED" } }, orderBy: [{ order: "asc" }], take: 1, select: { title: true } },
      _count: { select: { milestones: true } },
    },
  });
  const data = serialize(projects) as typeof projects;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Portal" title="Projetos" description="Acompanhe etapas, prazos e entregas." />
      {data.length === 0 ? (
        <Card><EmptyState icon={FolderKanban} title="Nenhum projeto por aqui" description="Quando um projeto for iniciado com a Unitrix, ele aparece nesta página." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((p) => {
            const done = p.status === "COMPLETED" || p.status === "DELIVERED";
            return (
              <Link key={p.id} href={`/cliente/projetos/${p.id}`} className="group block focus-visible:outline-none">
                <Card className="h-full p-5 transition-colors group-hover:border-border-strong group-focus-visible:ring-2 group-focus-visible:ring-accent/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <StatusBadge map={PROJECT_STATUS_MAP} status={p.status} />
                      <h2 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-foreground">{p.title}</h2>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground-dim transition-colors group-hover:text-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between">
                      <span className="eyebrow">Progresso</span>
                      <span className="num text-sm text-foreground">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="mt-2" />
                    <p className="mt-2 truncate text-xs text-foreground-muted">
                      {p.milestones[0] ? <>Próxima etapa: <span className="text-foreground">{p.milestones[0].title}</span></> : p._count.milestones ? "Todas as etapas concluídas" : "Etapas em definição"}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-border pt-4">
                    <TimelinePrazo startDate={p.startDate} endDate={p.endDate} completed={done} label="Prazo" />
                  </div>
                  {p.delivery && (
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-foreground-dim">Entrega</span>
                      <StatusBadge map={CLIENT_DELIVERY_MAP} status={p.delivery.status === "RELEASED" ? "RELEASED" : "PENDING"} />
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
