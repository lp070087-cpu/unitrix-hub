import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";

async function getApresentacoes() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });
  return clients;
}

export default async function ApresentacoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const clients = await getApresentacoes();

  return (
    <>
      <AdminHeader title="Apresentações" />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="card-premium p-5">
          <h3 className="text-sm font-bold text-foreground mb-2">Nova Apresentação</h3>
          <p className="text-xs text-foreground-muted mb-4">Selecione um cliente para gerar o link da apresentação comercial.</p>
          <div className="space-y-2">
            {clients.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-surface-hover transition-colors">
                <div>
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  {c.company && <span className="text-xs text-foreground-muted ml-2">— {c.company}</span>}
                </div>
                <a href={`/apresentacao/${c.id}`} className="text-[11px] text-accent hover:underline font-semibold">Gerar Link →</a>
              </div>
            ))}
          </div>
          {clients.length === 0 && <p className="text-sm text-foreground-muted py-8 text-center">Cadastre clientes primeiro.</p>}
        </div>
      </div>
    </>
  );
}
