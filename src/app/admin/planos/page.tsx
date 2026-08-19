import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";

async function getPlanos() {
  return prisma.plan.findMany({ orderBy: { price: "asc" } });
}

export default async function PlanosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const planos = await getPlanos();

  return (
    <>
      <AdminHeader title="Planos" />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planos.map((p: any) => (
            <div key={p.id} className="card-premium p-5">
              <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
              <p className="text-xs text-foreground-muted mt-1">{p.description}</p>
              <p className="text-xl font-black text-accent font-mono mt-3">
                R$ {Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                <span className="text-xs font-normal text-foreground-dim">/{p.interval === "MONTHLY" ? "mês" : "ano"}</span>
              </p>
              {p.features && (
                <div className="mt-3 space-y-1">
                  {(typeof p.features === "string" ? JSON.parse(p.features) : p.features).map((f: string, i: number) => (
                    <p key={i} className="text-[11px] text-foreground-dim">• {f}</p>
                  ))}
                </div>
              )}
              <span className={`mt-3 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.active ? "bg-accent/10 text-accent" : "bg-red-400/10 text-red-400"}`}>
                {p.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
        {planos.length === 0 && <p className="text-sm text-foreground-muted py-20 text-center">Nenhum plano cadastrado. Execute o seed.</p>}
      </div>
    </>
  );
}
