// Placeholder pages for client area — implemented in phases 2-3

const placeholders: Record<string, { title: string; desc: string; phase: string }> = {
  apresentacoes: { title: "Apresentações", desc: "Visualize as apresentações comerciais enviadas pela Unitrix.", phase: "Fase 2" },
  contratos: { title: "Contratos", desc: "Visualize e assine contratos digitais.", phase: "Fase 2" },
  projetos: { title: "Projetos", desc: "Acompanhe o progresso dos seus projetos.", phase: "Fase 3" },
  pagamentos: { title: "Pagamentos", desc: "Histórico completo de pagamentos e mensalidades.", phase: "Fase 3" },
  notificacoes: { title: "Notificações", desc: "Central de avisos e atualizações dos seus projetos.", phase: "Fase 4" },
};

export function ClientPlaceholderPage({ slug }: { slug: string }) {
  const data = placeholders[slug];
  if (!data) return null;

  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-xs font-black text-accent">
          {data.phase}
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{data.title}</h2>
      <p className="text-sm text-foreground-muted max-w-sm mb-6">{data.desc}</p>
      <span className="text-xs font-semibold text-foreground-dim px-3 py-1 rounded-full bg-surface border border-border">
        Disponível na {data.phase}
      </span>
    </div>
  );
}
