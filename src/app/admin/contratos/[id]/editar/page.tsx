import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { getClientOptions } from "@/lib/contracts/queries";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/states";
import { formatDateInput } from "@/lib/utils";
import { ContractForm, type ClientOpt } from "../../contract-form";

export const dynamic = "force-dynamic";

export default async function EditarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const c = await prisma.contract.findUnique({ where: { id } });
  if (!c) notFound();
  if (c.status !== "DRAFT") redirect(`/admin/contratos/${c.id}`);
  const clients = (await getClientOptions()) as ClientOpt[];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/contratos/${c.id}`}><ArrowLeft strokeWidth={1.6} /> Voltar ao contrato</Link>
      </Button>
      <PageHeader eyebrow={`Rascunho · versão ${c.version}`} title="Editar contrato" description="Ao salvar, o documento é regenerado com os novos dados." />
      <ContractForm
        contractId={c.id}
        clients={clients}
        initial={{
          clientId: c.clientId,
          projectId: c.projectId ?? "",
          title: c.title,
          scope: c.scope,
          value: String(Number(c.value)),
          deadline: formatDateInput(c.deadline),
          startDate: formatDateInput(c.startDate),
          endDate: formatDateInput(c.endDate),
          deliveryPeriod: c.deliveryPeriod ?? "",
          conditions: c.conditions ?? "",
          projectType: c.projectType ?? "",
        }}
      />
    </div>
  );
}
