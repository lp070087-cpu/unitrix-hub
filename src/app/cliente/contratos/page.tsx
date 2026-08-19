import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ClienteContratosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const client = await prisma.client.findUnique({
    where: { email: session.user.email! },
    include: { contracts: { orderBy: { createdAt: "desc" } } },
  });

  if (!client) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground-muted">Cliente não encontrado.</p></div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Contratos</h1>
        <p className="text-xs text-foreground-muted mt-1">Contratos gerados pela Unitrix</p>
      </div>
      {client.contracts.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-foreground-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p className="text-sm text-foreground-muted">Nenhum contrato disponível.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {client.contracts.map((c: any) => (
            <div key={c.id} className="card-premium p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
                  <p className="text-xs text-foreground-muted mt-1">{c.scope}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  c.signedAt ? "bg-green-400/10 text-green-400" :
                  c.readConfirmed ? "bg-yellow-400/10 text-yellow-400" :
                  "bg-surface-hover text-foreground-dim"
                }`}>
                  {c.signedAt ? "Assinado" : c.readConfirmed ? "Lido" : "Pendente"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div><span className="text-foreground-dim">Valor:</span> <span className="font-mono font-semibold text-foreground">R$ {Number(c.value).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</span></div>
                <div><span className="text-foreground-dim">Prazo:</span> <span className="font-semibold text-foreground">{new Date(c.deadline).toLocaleDateString("pt-BR")}</span></div>
                <div><span className="text-foreground-dim">Status:</span> <span className="font-semibold">{c.status}</span></div>
                <div>
                  {c.signedAt ? (
                    <span className="text-green-400">Assinado em {new Date(c.signedAt).toLocaleDateString("pt-BR")}</span>
                  ) : (
                    <a href={`/contrato/${c.slug}`} target="_blank" className="text-accent hover:underline font-semibold">Visualizar →</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
