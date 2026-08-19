"use client";

import { TimelinePrazo } from "@/components/shared/timeline-prazo";

export function ProjetosClienteClient({ client }: { client: any }) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Projetos</h1>
        <p className="text-xs text-foreground-muted mt-1">{client.projects?.length || 0} projeto(s)</p>
      </div>
      {(!client.projects || client.projects.length === 0) ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-sm text-foreground-muted">Nenhum projeto vinculado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {client.projects.map((p: any) => (
            <div key={p.id} className="card-premium p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                  <p className="text-[11px] text-foreground-muted mt-0.5">
                    {p.description} · {p.milestones?.length || 0} etapas
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-accent font-mono">{p.progress}%</span>
                  <p className="text-[10px] text-foreground-dim">concluído</p>
                </div>
              </div>

              {p.startDate && p.endDate && (
                <TimelinePrazo startDate={p.startDate} endDate={p.endDate} />
              )}

              {p.milestones?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border space-y-1.5">
                  <p className="text-[10px] font-semibold text-foreground-dim uppercase tracking-wider mb-2">
                    Etapas ({p.milestones.filter((m: any) => m.status === "COMPLETED").length}/{p.milestones.length})
                  </p>
                  {p.milestones.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        m.status === "COMPLETED" ? "bg-accent" :
                        m.status === "IN_PROGRESS" ? "bg-accent shadow-[0_0_6px_rgba(184,255,46,0.5)]" :
                        "bg-white/[0.06]"
                      }`} />
                      <span className={`text-[11px] ${m.status === "COMPLETED" ? "line-through text-foreground-dim" : m.status === "IN_PROGRESS" ? "text-foreground font-medium" : "text-foreground-dim"}`}>
                        {m.title}
                      </span>
                      {m.completedAt && <span className="text-[9px] text-foreground-dim ml-auto">{new Date(m.completedAt).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
