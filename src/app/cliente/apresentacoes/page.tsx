import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ClienteApresentacoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const client = await prisma.client.findUnique({
    where: { email: session.user.email! },
    include: { presentations: { orderBy: { createdAt: "desc" } } },
  });

  if (!client) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground-muted">Cliente não encontrado.</p></div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Apresentações</h1>
          <p className="text-xs text-foreground-muted mt-1">Apresentações comerciais recebidas da Unitrix</p>
        </div>
      </div>
      {client.presentations.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-foreground-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <p className="text-sm text-foreground-muted">Nenhuma apresentação recebida ainda.</p>
          <p className="text-xs text-foreground-dim mt-1">Quando a Unitrix enviar uma apresentação, ela aparecerá aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.presentations.map((p: any) => (
            <div key={p.id} className="card-premium p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.status === "VIEWED" ? "bg-accent/10 text-accent" :
                  p.status === "SENT" ? "bg-yellow-400/10 text-yellow-400" :
                  "bg-surface-hover text-foreground-dim"
                }`}>
                  {p.status === "SENT" ? "Enviada" : p.status === "VIEWED" ? "Visualizada" : p.status}
                </span>
              </div>
              {p.viewedAt && <p className="text-[11px] text-foreground-dim">Visualizada em {new Date(p.viewedAt).toLocaleDateString("pt-BR")}</p>}
              {p.sentAt && <p className="text-[11px] text-foreground-dim">Enviada em {new Date(p.sentAt).toLocaleDateString("pt-BR")}</p>}
              <a href={`/apresentacao/${p.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold mt-3">
                Visualizar →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
