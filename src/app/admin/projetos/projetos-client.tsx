"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";
import { formatCurrency } from "@/lib/utils";
import { createProject } from "./actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProjetosClient({ projetos, clients }: { projetos: any[]; clients: any[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createProject(fd);
      toast.success("Projeto criado!");
      setShowNew(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-muted">{projetos.length} projeto(s)</span>
        <button onClick={() => setShowNew(!showNew)} className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Novo Projeto
        </button>
      </div>

      {/* Modal novo projeto */}
      {showNew && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <h4 className="text-sm font-bold text-foreground mb-4">Novo Projeto</h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">Título *</label>
                <input name="title" required className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">Cliente *</label>
                <select name="clientId" required className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40">
                  <option value="">Selecionar...</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">Data de Início *</label>
                <input name="startDate" type="date" required className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">Prazo de Entrega *</label>
                <input name="endDate" type="date" required className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1">Descrição</label>
              <input name="description" className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn btn-primary text-xs py-2 px-4">
                {loading ? "Criando..." : "Criar Projeto"}
              </button>
              <button type="button" onClick={() => setShowNew(false)} className="text-xs text-foreground-muted hover:text-foreground">Cancelar</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid de projetos */}
      {projetos.length === 0 ? (
        <p className="text-sm text-foreground-muted py-20 text-center">Nenhum projeto cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projetos.map((p: any) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link href={`/admin/projetos/${p.id}`} className="text-sm font-bold text-foreground hover:text-accent transition-colors">
                    {p.title}
                  </Link>
                  <p className="text-[11px] text-foreground-dim mt-0.5">
                    {p.client?.name || "—"} · {p.milestones?.length || 0} etapas
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.status === "COMPLETED" ? "bg-green-400/10 text-green-400" :
                  p.status === "IN_PROGRESS" ? "bg-accent/10 text-accent" :
                  p.status === "REVIEW" ? "bg-yellow-400/10 text-yellow-400" :
                  "bg-blue-400/10 text-blue-400"
                }`}>
                  {p.status === "IN_PROGRESS" ? "Em Andamento" :
                   p.status === "COMPLETED" ? "Concluído" :
                   p.status === "REVIEW" ? "Revisão" :
                   p.status === "DELIVERED" ? "Entregue" : "Planejamento"}
                </span>
              </div>
              {p.startDate && p.endDate && (
                <TimelinePrazo startDate={p.startDate} endDate={p.endDate} />
              )}
              {p.payments?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border text-[11px] text-foreground-dim">
                  Pagamentos: {p.payments.filter((pay: any) => pay.status === "PAID").length}/{p.payments.length} recebidos ·{" "}
                  {formatCurrency(Number(p.payments.reduce((s: number, pay: any) => s + Number(pay.amount), 0)))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
