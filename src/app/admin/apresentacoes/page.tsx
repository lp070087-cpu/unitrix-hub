import Link from "next/link";
import { Presentation as PresentationIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DocStatusBadge } from "@/components/documents/status-badge";
import { formatDate } from "@/lib/utils";
import { NewPresentationDialog } from "./new-presentation-dialog";

export const dynamic = "force-dynamic";

export default async function AdminApresentacoesPage() {
  await requireAdmin();
  const [items, clients] = await Promise.all([
    prisma.presentation.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, sentAt: true, viewedAt: true, acceptedAt: true, updatedAt: true, client: { select: { name: true, company: true } }, project: { select: { title: true } } },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true, projects: { select: { id: true, title: true }, orderBy: { createdAt: "desc" } } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documentos"
        title="Apresentações"
        description="Propostas comerciais em formato de website, com link privado e aprovação pelo cliente."
        actions={<NewPresentationDialog clients={clients} />}
      />
      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={PresentationIcon}
            title="Nenhuma apresentação"
            description={clients.length ? "Crie uma apresentação para um cliente. Ela começa como rascunho com seções sugeridas." : "Cadastre um cliente antes de criar apresentações."}
          />
        </Card>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/apresentacoes/${p.id}`} className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium">{p.title}</p>
                    <DocStatusBadge kind="presentation" status={p.status} />
                  </div>
                  <p className="mt-1 truncate text-[13px] text-foreground-muted">{p.client.company || p.client.name}{p.project ? ` · ${p.project.title}` : ""}</p>
                  <p className="mt-2 text-xs text-foreground-dim">Atualizada {formatDate(p.updatedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Card className="hidden md:block">
            <Table>
              <THead>
                <tr><TH>Apresentação</TH><TH>Cliente</TH><TH>Status</TH><TH>Enviada</TH><TH>Visualizada</TH><TH>Aprovada</TH></tr>
              </THead>
              <TBody>
                {items.map((p) => (
                  <TR key={p.id}>
                    <TD className="max-w-[300px]">
                      <Link href={`/admin/apresentacoes/${p.id}`} className="block truncate font-medium hover:text-accent">{p.title}</Link>
                      {p.project && <span className="block truncate text-xs text-foreground-dim">{p.project.title}</span>}
                    </TD>
                    <TD className="max-w-[200px] truncate text-foreground-muted">{p.client.company || p.client.name}</TD>
                    <TD><DocStatusBadge kind="presentation" status={p.status} /></TD>
                    <TD className="text-foreground-muted">{formatDate(p.sentAt)}</TD>
                    <TD className="text-foreground-muted">{formatDate(p.viewedAt)}</TD>
                    <TD className="text-foreground-muted">{formatDate(p.acceptedAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
