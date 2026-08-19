"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { markPaymentPaid } from "../projetos/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function FinanceiroClient({ data }: { data: any }) {
  const router = useRouter();
  const [filter, setFilter] = useState("todos");

  const filtered = filter === "todos" ? data.payments :
    data.payments.filter((p: any) => p.status === (filter === "pagos" ? "PAID" : "PENDING"));

  async function handleMarkPaid(id: string) {
    try { await markPaymentPaid(id); toast.success("Pagamento confirmado!"); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-accent" /></div>
            <div>
              <span className="text-xs text-foreground-muted">Total Recebido</span>
              <p className="text-xl font-black text-white font-mono">{formatCurrency(Number(data.totalPaid))}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-400" /></div>
            <div>
              <span className="text-xs text-foreground-muted">Total Pendente</span>
              <p className="text-xl font-black text-white font-mono">{formatCurrency(Number(data.totalPending))}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {["todos", "pagos", "pendentes"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all ${
              filter === f ? "bg-accent/10 text-accent" : "text-foreground-dim hover:text-foreground"
            }`}>
            {f === "todos" ? "Todos" : f === "pagos" ? "Pagos" : "Pendentes"}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="card-premium overflow-hidden">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,80px] gap-4 px-5 py-2.5 bg-surface-hover text-[10px] font-bold text-foreground-dim uppercase tracking-wider">
          <span>Descrição / Cliente</span><span>Tipo</span><span>Valor</span><span>Status</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground-muted py-12 text-center">Nenhum pagamento encontrado.</p>
        ) : (
          filtered.map((p: any) => (
            <div key={p.id} className="grid grid-cols-[2fr,1fr,1fr,1fr,80px] gap-4 px-5 py-3 border-b border-border last:border-0 items-center text-sm hover:bg-surface-hover transition-colors">
              <div>
                <span className="font-semibold text-foreground">{p.description}</span>
                <p className="text-[11px] text-foreground-dim">
                  <Link href={`/admin/clientes/${p.client?.id}`} className="hover:text-accent">{p.client?.name}</Link>
                  {p.project && <> · {p.project.title}</>}
                </p>
              </div>
              <span className="text-[11px] text-foreground-muted">
                {p.type === "DEPOSIT" ? "Entrada" : p.type === "FINAL_BALANCE" ? "Saldo Final" : "Mensalidade"}
              </span>
              <span className="font-mono text-xs font-bold">{formatCurrency(Number(p.amount))}</span>
              <span className={`text-[11px] font-semibold ${
                p.status === "PAID" ? "text-green-400" : p.status === "OVERDUE" ? "text-red-400" : "text-yellow-400"
              }`}>
                {p.status === "PAID" ? "Pago" : p.status === "OVERDUE" ? "Atrasado" : "Pendente"}
              </span>
              <span>
                {p.status !== "PAID" && (
                  <button onClick={() => handleMarkPaid(p.id)} className="text-[10px] text-accent hover:underline font-semibold">Confirmar</button>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
