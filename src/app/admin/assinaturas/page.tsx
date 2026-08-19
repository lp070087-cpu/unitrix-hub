import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { formatCurrency } from "@/lib/utils";

async function getAssinaturas() {
  return prisma.subscription.findMany({
    orderBy: { startedAt: "desc" },
    include: { client: { select: { id: true, name: true } }, plan: { select: { name: true, price: true } } },
  });
}

export default async function AssinaturasPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const assinaturas = await getAssinaturas();

  return (
    <>
      <AdminHeader title="Assinaturas" />
      <div className="p-6 lg:p-8 space-y-6">
        {assinaturas.length === 0 ? (
          <p className="text-sm text-foreground-muted py-20 text-center">Nenhuma assinatura ativa.</p>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-5 py-2.5 bg-surface-hover text-[10px] font-bold text-foreground-dim uppercase">
              <span>Cliente / Plano</span><span>Valor</span><span>Início</span><span>Status</span>
            </div>
            {assinaturas.map((s: any) => (
              <div key={s.id} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-5 py-3 border-b border-border last:border-0 items-center text-sm">
                <div><span className="font-semibold">{s.client?.name}</span><p className="text-[11px] text-foreground-dim">{s.plan?.name}</p></div>
                <span className="font-mono text-xs font-bold">{formatCurrency(Number(s.plan?.price || 0))}</span>
                <span className="text-[11px] text-foreground-muted">{new Date(s.startedAt).toLocaleDateString("pt-BR")}</span>
                <span className={`text-[11px] font-semibold ${s.status === "ACTIVE" ? "text-green-400" : s.status === "PAUSED" ? "text-yellow-400" : "text-red-400"}`}>
                  {s.status === "ACTIVE" ? "Ativa" : s.status === "PAUSED" ? "Pausada" : "Cancelada"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
