import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatDate } from "@/lib/utils";
import { NewBriefingDialog } from "./new-briefing-dialog";

export const dynamic = "force-dynamic";

export default async function ClienteBriefingPage() {
  const { clientId } = await requireClient();
  const [briefings, projects] = await Promise.all([
    prisma.briefing.findMany({
      where: { clientId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, updatedAt: true, submittedAt: true, project: { select: { title: true } } },
    }),
    prisma.project.findMany({ where: { clientId, briefing: null }, select: { id: true, title: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projeto"
        title="Briefing"
        description="Conte sobre seu negócio e o que precisa. É a base para proposta, escopo e contrato."
        actions={<NewBriefingDialog projects={projects} />}
      />
      {briefings.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title="Nenhum briefing ainda" description="Crie um briefing e preencha em etapas. Você pode salvar o rascunho e voltar depois." />
        </Card>
      ) : (
        <ul className="space-y-3">
          {briefings.map((b) => {
            const action = b.status === "DRAFT" ? "Continuar preenchimento" : b.status === "REVISION_REQUESTED" ? "Revisar e reenviar" : "Ver briefing";
            return (
              <li key={b.id}>
                <Link href={`/cliente/briefing/${b.id}`} className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <DocStatusBadge kind="briefing" status={b.status} />
                    <p className="mt-2 truncate text-[15px] font-medium text-foreground">{b.title}</p>
                    <p className="mt-0.5 text-[13px] text-foreground-muted">
                      {b.project ? `${b.project.title} · ` : ""}{b.submittedAt ? `enviado em ${formatDate(b.submittedAt)}` : `atualizado em ${formatDate(b.updatedAt)}`}
                    </p>
                  </div>
                  <span className={b.status === "REVISION_REQUESTED" || b.status === "DRAFT" ? "inline-flex items-center gap-1.5 text-sm font-medium text-accent" : "inline-flex items-center gap-1.5 text-sm text-foreground-muted"}>
                    {action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
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
