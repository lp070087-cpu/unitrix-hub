"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Users, FolderKanban, DollarSign, Clock, ArrowUpRight, CalendarClock } from "lucide-react";
import { formatCurrency, CLIENT_STATUS_MAP } from "@/lib/utils";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";
import Link from "next/link";

interface Stats {
  totalClients: number; activeProjects: number;
  monthlyRevenue: any; pendingPayments: any;
  recentClients: any[]; recentPayments: any[];
  activeProjectsList: any[];
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

function StatCard({ label, value, icon: Icon, href }: { label: string; value: string; icon: any; href?: string }) {
  return (
    <motion.div variants={item} className="card-premium p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-foreground-muted uppercase">{label}</span>
        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
      </div>
      <p className="text-2xl font-black tracking-tight text-white font-mono">{value}</p>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-xs text-accent mt-2 hover:underline">
          Ver detalhes <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = CLIENT_STATUS_MAP[status] || { label: status, color: "text-zinc-400" };
  return <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>;
}

export function DashboardClient({ stats }: { stats: Stats }) {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Métricas */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Clientes" value={String(stats.totalClients)} icon={Users} href="/admin/clientes" />
        <StatCard label="Projetos Ativos" value={String(stats.activeProjects)} icon={FolderKanban} href="/admin/projetos" />
        <StatCard label="Receita (Total Pago)" value={formatCurrency(Number(stats.monthlyRevenue))} icon={DollarSign} href="/admin/financeiro" />
        <StatCard label="Pagamentos Pendentes" value={formatCurrency(Number(stats.pendingPayments))} icon={Clock} href="/admin/financeiro" />
      </motion.div>

      {/* Timeline de Prazos */}
      {stats.activeProjectsList.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Prazos de Entrega</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.activeProjectsList.map((project: any) => (
              <div key={project.id} className="space-y-2">
                <Link href={`/admin/projetos/${project.id}`} className="text-sm font-semibold text-foreground hover:text-accent transition-colors">
                  {project.title}
                </Link>
                <p className="text-[11px] text-foreground-dim">{project.client?.name || "—"}</p>
                <TimelinePrazo startDate={project.startDate} endDate={project.endDate} label="Prazo" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Clientes + Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={container} initial="hidden" animate="show" className="card-premium p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Clientes Recentes</h3>
          <div className="space-y-3">
            {stats.recentClients.length === 0 ? (
              <p className="text-sm text-foreground-muted py-8 text-center">Nenhum cliente cadastrado ainda.</p>
            ) : (
              stats.recentClients.map((c: any) => (
                <motion.div key={c.id} variants={item} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <Link href={`/admin/clientes/${c.id}`} className="text-sm font-semibold text-foreground hover:text-accent transition-colors">{c.name}</Link>
                    {c.company && <p className="text-xs text-foreground-muted">{c.company}</p>}
                  </div>
                  <StatusBadge status={c.status} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="card-premium p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Pagamentos Recentes</h3>
          <div className="space-y-3">
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-foreground-muted py-8 text-center">Nenhum pagamento registrado.</p>
            ) : (
              stats.recentPayments.map((p: any) => (
                <motion.div key={p.id} variants={item} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.client?.name || "—"}</p>
                    <p className="text-xs text-foreground-muted">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-foreground">{formatCurrency(Number(p.amount))}</p>
                    <p className={`text-xs font-semibold ${p.status === "PAID" ? "text-green-400" : "text-yellow-400"}`}>
                      {p.status === "PAID" ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
