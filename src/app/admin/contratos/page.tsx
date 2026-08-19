import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";

async function getContratos() {
  const clients = await prisma.client.findMany({
    where: { status: { in: ["PROPOSAL_SENT", "NEGOTIATION", "CONTRACTED", "IN_PROGRESS"] } },
    select: { id: true, name: true, company: true, projectType: true, budget: true, status: true },
    orderBy: { name: "asc" },
  });
  return clients;
}

export default async function ContratosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const clients = await getContratos();

  return (
    <>
      <AdminHeader title="Contratos" />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="card-premium p-5">
          <h3 className="text-sm font-bold text-foreground mb-2">Gerar Contrato</h3>
          <p className="text-xs text-foreground-muted mb-4">Selecione um cliente com proposta aprovada para gerar o contrato inteligente.</p>
          <div className="space-y-2">
            {clients.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-surface-hover transition-colors">
                <div>
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="text-xs text-foreground-muted ml-2">
                    — {c.projectType || "Sem tipo"} {c.budget && `· R$ ${Number(c.budget).toLocaleString("pt-BR")}`}
                  </span>
                </div>
                <span className="text-[11px] text-accent hover:underline font-semibold cursor-pointer">Gerar Contrato →</span>
              </div>
            ))}
          </div>
          {clients.length === 0 && <p className="text-sm text-foreground-muted py-8 text-center">Nenhum cliente elegível. Mova clientes para o status &quot;Proposta Enviada&quot; ou superior.</p>}
        </div>
      </div>
    </>
  );
}
