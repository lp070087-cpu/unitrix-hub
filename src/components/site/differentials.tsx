import { Code2, LayoutDashboard, MonitorSmartphone, Plug, LifeBuoy, Server, KeyRound, Activity, type LucideIcon } from "lucide-react";
import { SectionHeading } from "./section-heading";

const items: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Code2, t: "Desenvolvimento personalizado", d: "Nada de templates engessados: arquitetura e interface pensadas para o seu caso." },
  { icon: LayoutDashboard, t: "Painéis administrativos", d: "Gestão do conteúdo e da operação sem depender de terceiros." },
  { icon: MonitorSmartphone, t: "Soluções responsivas", d: "Experiência consistente do celular ao monitor ultrawide." },
  { icon: Plug, t: "Integrações", d: "Conexão com pagamentos, CRMs, ERPs, e-mail, WhatsApp e APIs." },
  { icon: LifeBuoy, t: "Suporte técnico", d: "Canal direto para dúvidas, correções e evolução após a entrega." },
  { icon: Server, t: "Infraestrutura", d: "Hospedagem, domínio, SSL, deploy e monitoramento configurados." },
  { icon: KeyRound, t: "Portal do cliente", d: "Acesso exclusivo a contratos, apresentações, entregas e pagamentos." },
  { icon: Activity, t: "Acompanhamento de projeto", d: "Progresso, etapas e notificações em tempo real, sem planilhas soltas." },
];

export function Differentials() {
  return (
    <section id="diferenciais" className="scroll-mt-20 py-24 sm:py-32" aria-labelledby="diferenciais-title">
      <div className="container">
        <SectionHeading
          index="04"
          eyebrow="Diferenciais"
          id="diferenciais-title"
          title="O que vem junto"
          accent="em cada projeto."
        />
        <ul className="mt-16 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, t, d }) => (
            <li key={t} className="group border-b border-r border-border p-6 transition-colors hover:bg-surface sm:p-8">
              <Icon className="h-5 w-5 text-foreground-dim transition-colors group-hover:text-accent" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-8 text-[15px] font-medium">{t}</h3>
              <p className="mt-2 text-pretty text-[13px] leading-relaxed text-foreground-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
