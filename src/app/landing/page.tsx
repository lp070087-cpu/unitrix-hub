// ═══════════ UNITRIX HUB — Landing Page Comercial ═══════════
// Origens: Banco XP (glowbox, círculos), Iron Man (stats, progresso),
// SaaS Template (nav, cards, footer), IA Template (grid, bento, dashboard overlay)
import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { CinematicIntro } from "@/components/landing/cinematic-intro";
import {
  SectionHeader, IconCard, StatCard, DashboardPreview,
  TimelineStep, BentoFeature, CTASection,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <>
      <CinematicIntro />
      <LandingNav />
      <LandingHero />

      {/* ═══════════ 2. PROBLEMA ═══════════ */}
      <section id="problema" className="py-24 sm:py-32 px-6">
        <SectionHeader
          tag="O Problema"
          title="Sua gestão está espalhada em vários lugares?"
          sub="Contratos no WhatsApp, pagamentos no Excel, prazos na cabeça. Chegou a hora de unificar tudo."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <IconCard icon="📄" title="Contratos Espalhados" desc="Cada cliente com um contrato diferente, sem padronização, sem controle de versão e sem assinatura digital." />
          <IconCard icon="💰" title="Pagamentos Desorganizados" desc="Sem controle de quem pagou, quanto falta, datas de vencimento. Entradas e saldos finais sem registro." />
          <IconCard icon="⏰" title="Prazos sem Controle" desc="Projetos atrasando sem visibilidade. Clientes perguntando 'quando fica pronto?' e você sem resposta precisa." />
          <IconCard icon="📱" title="Comunicação Fragmentada" desc="WhatsApp, email, ligações. Informações perdidas em conversas que desaparecem." />
          <IconCard icon="🔒" title="Sem Área do Cliente" desc="Clientes não têm onde acompanhar o projeto. Tudo depende de você responder manualmente." />
          <IconCard icon="📊" title="Falta de Visibilidade" desc="Quantos projetos ativos? Qual o faturamento? Quanto ainda vai receber? Sem dashboard, sem resposta." />
        </div>
      </section>

      {/* ═══════════ 3. SOLUÇÃO ═══════════ */}
      <section id="solucao" className="py-24 sm:py-32 px-6 border-t border-white/[0.04]">
        <SectionHeader
          tag="A Solução"
          title="Unitrix Hub: a plataforma completa de gestão"
          sub="Painel administrativo, área exclusiva do cliente e todas as ferramentas para gerenciar projetos do início ao fim."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <BentoFeature icon="📋" title="Painel Administrativo" desc="Dashboard completo com métricas, clientes recentes, projetos ativos e pagamentos pendentes." large />
          <BentoFeature icon="👤" title="Área do Cliente" desc="Cada cliente tem login próprio para acompanhar projetos, contratos e pagamentos." />
          <BentoFeature icon="📁" title="Projetos com Etapas" desc="Crie projetos com milestones. Cada etapa concluída atualiza o progresso automaticamente." />
          <BentoFeature icon="⏳" title="Timeline de Prazo" desc="Barra visual de progresso com dias restantes, status automático e data de entrega." />
          <BentoFeature icon="💳" title="Financeiro" desc="Controle entrada (50%), saldo final (50%) e mensalidades. Status de cada pagamento." />
          <BentoFeature icon="📝" title="Contratos Inteligentes" desc="Preenchimento automático com dados do cliente. Confirmação de leitura + assinatura digital." />
          <BentoFeature icon="🎯" title="Apresentações Premium" desc="Apresentações comerciais em formato website com link exclusivo para cada cliente." />
          <BentoFeature icon="🔄" title="Assinaturas Mensais" desc="Hospedagem + suporte 24h com cobrança recorrente. Valor a partir de R$ 397/mês." />
          <BentoFeature icon="🔔" title="Notificações" desc="Alertas automáticos de novos contratos, atualizações de projeto e pagamentos aprovados." />
        </div>
      </section>

      {/* ═══════════ 4. DEMONSTRAÇÃO VISUAL ═══════════ */}
      <section id="demo" className="py-24 sm:py-32 px-6 border-t border-white/[0.04]">
        <SectionHeader
          tag="Demonstração"
          title="Veja o sistema por dentro"
          sub="Telas reais do Unitrix Hub. O mesmo visual premium que você e seus clientes vão usar no dia a dia."
        />
        <DashboardPreview>
          {/* Simulação do dashboard admin dentro do frame */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Clientes", val: "5", color: "text-[#B8FF2E]" },
              { label: "Projetos", val: "2", color: "text-[#B8FF2E]" },
              { label: "Receita", val: "R$ 36.5K", color: "text-[#B8FF2E]" },
              { label: "Pendente", val: "R$ 36.5K", color: "text-yellow-400" },
            ].map(s => (
              <div key={s.label} className="bg-[rgba(0,0,0,0.3)] border border-white/[0.05] rounded-lg p-3">
                <p className="text-[9px] font-semibold text-[#555] uppercase tracking-wider">{s.label}</p>
                <p className={`text-sm sm:text-lg font-black font-mono ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[rgba(0,0,0,0.3)] border border-white/[0.05] rounded-lg p-3">
              <p className="text-[9px] font-semibold text-[#555] uppercase tracking-wider mb-2">Projetos Ativos</p>
              {["Fintech Pro — SaaS · 35%", "Clínica Vida — Sist. Web · 0%"].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                  <span className="text-[11px] text-[#CCC]">{p.split(" · ")[0]}</span>
                  <span className="text-[10px] font-mono font-bold text-[#B8FF2E]">{p.split(" · ")[1]}</span>
                </div>
              ))}
            </div>
            <div className="bg-[rgba(0,0,0,0.3)] border border-white/[0.05] rounded-lg p-3">
              <p className="text-[9px] font-semibold text-[#555] uppercase tracking-wider mb-2">Pagamentos Recentes</p>
              {[
                { desc: "Entrada — Fintech Pro", val: "R$ 22.500", ok: true },
                { desc: "Saldo — Fintech Pro", val: "R$ 22.500", ok: false },
                { desc: "Entrada — Clínica Vida", val: "R$ 14.000", ok: false },
              ].map((pay, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                  <span className="text-[11px] text-[#CCC]">{pay.desc}</span>
                  <span className={`text-[10px] font-mono font-bold ${pay.ok ? "text-green-400" : "text-yellow-400"}`}>
                    {pay.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardPreview>
      </section>

      {/* ═══════════ 5. TIMELINE DE ENTREGA ═══════════ */}
      <section id="timeline" className="py-24 sm:py-32 px-6 border-t border-white/[0.04] bg-[#0A0A0D]">
        <SectionHeader
          tag="Prazo de Entrega"
          title="Timeline com prazo automático"
          sub="O componente que mostra em tempo real: dias passados, dias restantes, progresso visual e status automático do projeto."
        />
        <div className="max-w-lg mx-auto">
          <DashboardPreview>
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Fintech Pro — Plataforma SaaS</span>
                <span className="text-xs font-mono font-black text-[#B8FF2E]">35%</span>
              </div>

              {/* Barra de progresso — Origem: Iron Man progress bar */}
              <div className="w-full h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div className="h-full bg-[#B8FF2E] rounded-full transition-all duration-700" style={{ width: "35%" }} />
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#B8FF2E] font-semibold">Em andamento</span>
                <span className="text-[#666]">
                  <span className="text-[#888] font-semibold">58 dias</span> restantes
                  <span className="mx-1 opacity-40">·</span>32/90 dias
                </span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-[#555] pt-2 border-t border-white/[0.04]">
                <span>Início: 01/06/2026</span>
                <span>Entrega: 01/09/2026</span>
              </div>

              {/* Milestones — Origem: Iron Man CinematicReveal */}
              <div className="space-y-1.5 pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">Etapas (2/6)</p>
                {[
                  { title: "Planejamento e Discovery", done: true },
                  { title: "Design UI/UX", done: true },
                  { title: "Desenvolvimento Backend", active: true },
                  { title: "Desenvolvimento Frontend", done: false },
                  { title: "Testes e QA", done: false },
                  { title: "Deploy e Entrega", done: false },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      m.done ? "bg-[#B8FF2E]" : m.active ? "bg-[#B8FF2E] shadow-[0_0_6px_rgba(184,255,46,0.5)]" : "bg-white/[0.06]"
                    }`} />
                    <span className={`text-[11px] ${m.done ? "line-through text-[#555]" : m.active ? "text-white font-medium" : "text-[#555]"}`}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardPreview>
        </div>
      </section>

      {/* ═══════════ 6. FLUXO DE FUNCIONAMENTO ═══════════ */}
      <section id="fluxo" className="py-24 sm:py-32 px-6">
        <SectionHeader
          tag="Fluxo"
          title="Do lead à entrega em um só lugar"
          sub="Um processo profissional que guia cada cliente por todas as etapas, sem nada perdido pelo caminho."
        />
        <div className="max-w-md mx-auto">
          <TimelineStep num="01" title="Cliente solicita o projeto" desc="Lead preenche o briefing com todas as informações: nicho, público, referências e expectativas." done />
          <TimelineStep num="02" title="Proposta e apresentação enviadas" desc="Unitrix cria apresentação exclusiva em formato website com escopo, cronograma e valores." done />
          <TimelineStep num="03" title="Contrato aceito e assinado" desc="Contrato inteligente preenchido automaticamente. Cliente confirma leitura e assina digitalmente." active />
          <TimelineStep num="04" title="Primeira parcela confirmada" desc="Pagamento de 50% registrado. Projeto entra em desenvolvimento automaticamente." />
          <TimelineStep num="05" title="Desenvolvimento iniciado" desc="Cliente acompanha cada etapa pelo Hub: Planejamento → Design → Desenvolvimento → Testes → Entrega." />
          <TimelineStep num="06" title="Cliente acompanha o prazo" desc="Timeline de prazo mostra dias restantes, progresso e etapas concluídas em tempo real." />
          <TimelineStep num="07" title="Projeto entregue" desc="Todas as milestones concluídas. Sistema notifica o cliente automaticamente." />
          <TimelineStep num="08" title="Segunda parcela confirmada" desc="Pagamento do saldo final (50%). Arquivos, código-fonte e acessos são liberados." />
          <TimelineStep num="09" title="Hospedagem e suporte ativados" desc="Plano mensal de hospedagem + suporte 24h é ativado. Cliente e projeto permanecem no Hub." />
        </div>
      </section>

      {/* ═══════════ 7. DIFERENCIAIS ═══════════ */}
      <section id="diferenciais" className="py-24 sm:py-32 px-6 border-t border-white/[0.04] bg-[#0A0A0D]">
        <SectionHeader
          tag="Diferenciais"
          title="Por que o Unitrix Hub?"
          sub="Não é apenas um sistema. É uma plataforma de relacionamento que transmite profissionalismo em cada interação."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "🎨", title: "Apresentação Premium", desc: "Propostas em formato website com design exclusivo. Nada de PDF genérico." },
            { icon: "🔐", title: "Área Personalizada", desc: "Cada cliente tem login, dashboard e acesso individual aos seus projetos." },
            { icon: "👁", title: "Acompanhamento Transparente", desc: "Cliente vê cada etapa do projeto. Nada escondido, nada perdido." },
            { icon: "📋", title: "Contratos Padronizados", desc: "Modelo mestre com preenchimento automático. Segurança jurídica em cada contrato." },
            { icon: "💳", title: "Controle Financeiro", desc: "Entrada, saldo e mensalidades. Status de cada pagamento com histórico completo." },
            { icon: "📱", title: "Experiência Responsiva", desc: "Funciona perfeitamente no celular, tablet e desktop. Acesso de qualquer lugar." },
            { icon: "🛡", title: "Segurança", desc: "Autenticação JWT, rotas protegidas, dados criptografados. Conformidade e privacidade." },
            { icon: "🎧", title: "Suporte Contínuo", desc: "Hospedagem + suporte 24h após a entrega. Relacionamento de longo prazo." },
            { icon: "📈", title: "Preparado para Crescer", desc: "Arquitetura escalável. Do primeiro cliente ao centésimo, o Hub acompanha." },
          ].map(d => (
            <IconCard key={d.title} {...d} />
          ))}
        </div>
      </section>

      {/* ═══════════ 8. STATS ═══════════ */}
      <section className="py-24 sm:py-32 px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-16 max-w-3xl mx-auto">
          <StatCard value="5+" label="Clientes Ativos" note="Em crescimento" />
          <StatCard value="2" label="Projetos" note="Em andamento" />
          <StatCard value="R$ 36.5K" label="Receita" note="Total processado" />
          <StatCard value="100%" label="Satisfação" note="Clientes recorrentes" />
        </div>
      </section>

      {/* ═══════════ 9. CTA FINAL ═══════════ */}
      <CTASection />

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.04] py-8 px-6 text-center text-[11px] text-[#444] tracking-[0.1em]">
        Unitrix Hub &copy; 2026 — unitrix.app — Desenvolvido com Next.js + Vercel + Neon
      </footer>
    </>
  );
}
