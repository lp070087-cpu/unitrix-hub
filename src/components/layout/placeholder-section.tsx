import { AdminHeader } from "@/components/layout/admin-sidebar";

// Placeholder — Fase 2: Apresentações & Contratos
const placeholders = {
  apresentacoes: {
    title: "Apresentações",
    desc: "Crie apresentações premium em formato website para seus clientes.",
    phase: "Fase 2",
  },
  contratos: {
    title: "Contratos",
    desc: "Gere contratos inteligentes com preenchimento automático e assinatura digital.",
    phase: "Fase 2",
  },
  financeiro: {
    title: "Financeiro",
    desc: "Gerencie pagamentos, entrada (50%), saldo final e assinaturas mensais.",
    phase: "Fase 3",
  },
  projetos: {
    title: "Projetos",
    desc: "Acompanhe projetos com timeline de produção e milestones.",
    phase: "Fase 3",
  },
  planos: {
    title: "Planos",
    desc: "Configure planos de assinatura e valores de projetos.",
    phase: "Fase 4",
  },
  assinaturas: {
    title: "Assinaturas",
    desc: "Gerencie assinaturas ativas, cobranças e renovações.",
    phase: "Fase 4",
  },
  notificacoes: {
    title: "Notificações",
    desc: "Central de notificações e alertas do sistema.",
    phase: "Fase 4",
  },
};

export default function PlaceholderSection({ slug }: { slug: string }) {
  const data = placeholders[slug as keyof typeof placeholders];
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

// ── Page exports ──

// app/admin/apresentacoes/page.tsx
export function ApresentacoesPage() {
  return (
    <>
      <AdminHeader title="Apresentações" />
      <PlaceholderSection slug="apresentacoes" />
    </>
  );
}

export function ContratosPage() {
  return (
    <>
      <AdminHeader title="Contratos" />
      <PlaceholderSection slug="contratos" />
    </>
  );
}

export function FinanceiroPage() {
  return (
    <>
      <AdminHeader title="Financeiro" />
      <PlaceholderSection slug="financeiro" />
    </>
  );
}

export function ProjetosPage() {
  return (
    <>
      <AdminHeader title="Projetos" />
      <PlaceholderSection slug="projetos" />
    </>
  );
}

export function PlanosPage() {
  return (
    <>
      <AdminHeader title="Planos" />
      <PlaceholderSection slug="planos" />
    </>
  );
}

export function AssinaturasPage() {
  return (
    <>
      <AdminHeader title="Assinaturas" />
      <PlaceholderSection slug="assinaturas" />
    </>
  );
}

export function NotificacoesPage() {
  return (
    <>
      <AdminHeader title="Notificações" />
      <PlaceholderSection slug="notificacoes" />
    </>
  );
}
