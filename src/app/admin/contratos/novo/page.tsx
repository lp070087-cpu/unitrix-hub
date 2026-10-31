import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { requireAdmin } from "@/lib/server/session";
import { getClientOptions } from "@/lib/contracts/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { ContractForm, type ClientOpt } from "../contract-form";

export const dynamic = "force-dynamic";

export default async function NovoContratoPage({ searchParams }: { searchParams: Promise<{ clientId?: string; projectId?: string }> }) {
  await requireAdmin();
  const [clients, sp] = await Promise.all([getClientOptions() as Promise<ClientOpt[]>, searchParams]);
  const preClient = clients.find((c) => c.id === sp.clientId);
  const preProject = preClient?.projects.find((p) => p.id === sp.projectId);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/contratos"><ArrowLeft strokeWidth={1.6} /> Contratos</Link>
      </Button>
      <PageHeader eyebrow="Contrato Mestre Unitrix" title="Novo contrato" description="Preencha os dados. O documento é gerado e congelado como versão 1 em rascunho; você revisa antes de enviar." />
      {clients.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title="Nenhum cliente cadastrado" description="Cadastre um cliente antes de gerar contratos." action={<Button asChild size="sm"><Link href="/admin/clientes">Ir para clientes</Link></Button>} />
        </Card>
      ) : (
        <ContractForm
          clients={clients}
          initial={
            preClient
              ? {
                  clientId: preClient.id,
                  projectType: preClient.projectType ?? "",
                  ...(preProject
                    ? {
                        projectId: preProject.id,
                        title: `Contrato — ${preProject.title}`,
                        value: preProject.totalValue != null ? String(Number(preProject.totalValue)) : "",
                        deadline: preProject.endDate?.slice(0, 10) ?? "",
                        endDate: preProject.endDate?.slice(0, 10) ?? "",
                        startDate: preProject.startDate?.slice(0, 10) ?? "",
                      }
                    : {}),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
