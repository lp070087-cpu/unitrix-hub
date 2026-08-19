"use client";

import { motion } from "framer-motion";
import { FolderKanban, FileText, DollarSign, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <motion.div className="card-premium p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-foreground-muted uppercase">{label}</span>
        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center"><Icon className="w-4 h-4 text-accent" /></div>
      </div>
      <p className="text-2xl font-black tracking-tight text-white font-mono">{value}</p>
    </motion.div>
  );
}

export function ClientDashboardClient({ client }: { client: any }) {
  const activeProject = client.projects?.[0];
  const totalPaid = client.payments?.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
  const totalPending = client.payments?.filter((p: any) => p.status === "PENDING").reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-foreground-dim uppercase mb-1">Bem-vindo(a) de volta</p>
          <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
          {client.company && <p className="text-sm text-foreground-muted">{client.company}</p>}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projetos Ativos" value={String(client.projects?.length || 0)} icon={FolderKanban} />
        <StatCard label="Contratos" value={String(client.contracts?.length || 0)} icon={FileText} />
        <StatCard label="Total Pago" value={formatCurrency(totalPaid)} icon={DollarSign} />
        <StatCard label="Pendente" value={formatCurrency(totalPending)} icon={CalendarClock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projeto Atual + Timeline de Prazo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Projeto Atual</h3>
          {activeProject ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold">{activeProject.title}</p>

              {/* Timeline de Prazo */}
              {activeProject.startDate && activeProject.endDate && (
                <TimelinePrazo startDate={activeProject.startDate} endDate={activeProject.endDate} label="Prazo de Entrega" />
              )}

              {/* Progresso */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-foreground-muted">Progresso</span>
                  <span className="font-mono font-bold text-accent">{activeProject.progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${activeProject.progress}%` }} transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }} />
                </div>
              </div>

              {/* Milestones */}
              {activeProject.milestones?.length > 0 && (
                <div className="space-y-2 pt-2">
                  {activeProject.milestones.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === "COMPLETED" ? "bg-green-400" : m.status === "IN_PROGRESS" ? "bg-accent" : "bg-surface-hover"}`} />
                      <span className={m.status === "COMPLETED" ? "text-foreground-muted line-through" : "text-foreground-muted"}>{m.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-foreground-muted py-8 text-center">Nenhum projeto em andamento.</p>
          )}
        </motion.div>

        {/* Pagamentos */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Pagamentos</h3>
          {client.payments?.length > 0 ? (
            <div className="space-y-2">
              {client.payments.slice(0, 8).map((pay: any) => (
                <div key={pay.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{pay.description}</p>
                    <p className="text-xs text-foreground-muted">{pay.type === "DEPOSIT" ? "Entrada (50%)" : pay.type === "FINAL_BALANCE" ? "Saldo Final (50%)" : "Mensalidade"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{formatCurrency(Number(pay.amount))}</p>
                    <p className={`text-xs font-semibold ${pay.status === "PAID" ? "text-green-400" : pay.status === "OVERDUE" ? "text-red-400" : "text-yellow-400"}`}>
                      {pay.status === "PAID" ? "Pago" : pay.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-muted py-8 text-center">Nenhum pagamento registrado.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
