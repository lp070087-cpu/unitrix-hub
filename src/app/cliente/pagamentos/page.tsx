import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function ClientePagamentosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const client = await prisma.client.findUnique({
    where: { email: session.user.email! },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!client) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground-muted">Cliente não encontrado.</p></div>;
  }

  const totalPaid = client.payments.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + Number(p.amount), 0);
  const totalPending = client.payments.filter((p: any) => p.status === "PENDING").reduce((s: number, p: any) => s + Number(p.amount), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Pagamentos</h1>
        <p className="text-xs text-foreground-muted mt-1">Histórico completo de pagamentos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-premium p-5">
          <p className="text-[10px] font-semibold text-foreground-dim uppercase tracking-wider mb-1">Total Pago</p>
          <p className="text-xl font-black text-green-400 font-mono">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card-premium p-5">
          <p className="text-[10px] font-semibold text-foreground-dim uppercase tracking-wider mb-1">Total Pendente</p>
          <p className="text-xl font-black text-yellow-400 font-mono">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      {client.payments.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-sm text-foreground-muted">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-5 py-2.5 bg-surface-hover text-[10px] font-bold text-foreground-dim uppercase tracking-wider">
            <span>Descrição</span><span>Tipo</span><span>Valor</span><span>Status</span>
          </div>
          {client.payments.map((p: any) => (
            <div key={p.id} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-5 py-3 border-b border-border last:border-0 items-center text-sm hover:bg-surface-hover transition-colors">
              <span className="font-semibold">{p.description}</span>
              <span className="text-[11px] text-foreground-muted">
                {p.type === "DEPOSIT" ? "Entrada (50%)" : p.type === "FINAL_BALANCE" ? "Saldo Final (50%)" : "Mensalidade"}
              </span>
              <span className="font-mono text-xs font-bold">{formatCurrency(Number(p.amount))}</span>
              <span className={`text-[11px] font-semibold ${p.status === "PAID" ? "text-green-400" : p.status === "OVERDUE" ? "text-red-400" : "text-yellow-400"}`}>
                {p.status === "PAID" ? "Pago" : p.status === "OVERDUE" ? "Atrasado" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
