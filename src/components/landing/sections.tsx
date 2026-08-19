"use client";
// Combina múltiplas origens da biblioteca em componentes reutilizáveis

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ═══════════ Reveal Observer ═══════════
   Origem: IA Template AnimatedSection + useReveal hook */
export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ═══════════ Section Header ═══════════ */
export function SectionHeader({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
      <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-[#B8FF2E] uppercase mb-4">
        <span className="w-4 h-[1px] bg-[#B8FF2E]/50" />
        {tag}
      </span>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white leading-[1.1]">
        {title}
      </h2>
      {sub && <p className="text-sm sm:text-base text-[#888] mt-4 max-w-lg mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ═══════════ Card de ícone ═══════════
   Origem: SaaS Template feature cards + Banco XP glass cards */
export function IconCard({ icon, title, desc, className = "" }: { icon: string; title: string; desc: string; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal card-lp ${className}`}>
      <div className="w-11 h-11 rounded-xl bg-[rgba(184,255,46,0.08)] flex items-center justify-center text-xl mb-4">{icon}</div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-[#888] leading-relaxed">{desc}</p>
    </div>
  );
}

/* ═══════════ Stat Card — Origem: Iron Man SystemsNominal ═══════════ */
export function StatCard({ value, label, note }: { value: string; label: string; note?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal text-center">
      <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-[-0.02em]">{value}</p>
      <p className="text-[11px] font-semibold text-[#B8FF2E] uppercase tracking-[0.2em] mt-1">{label}</p>
      {note && <p className="text-[11px] text-[#555] mt-1">{note}</p>}
    </div>
  );
}

/* ═══════════ Dashboard Preview Frame — Origem: IA Template DashboardPreview ═══════════ */
export function DashboardPreview({ children }: { children: React.ReactNode }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal-scale w-full max-w-5xl mx-auto">
      <div className="dash-frame">
        <div className="dash-topbar">
          <div className="dash-dot r" /><div className="dash-dot y" /><div className="dash-dot g" />
          <span className="dash-title">Unitrix Hub — Dashboard</span>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Timeline Step — Origem: Iron Man progress bar + CinematicReveal ═══════════ */
export function TimelineStep({ num, title, desc, done = false, active = false }: { num: string; title: string; desc: string; done?: boolean; active?: boolean }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal-l flex gap-4 relative">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${
            done ? "bg-[#B8FF2E] border-[#B8FF2E] text-[#08080A]" :
            active ? "border-[#B8FF2E] text-[#B8FF2E] bg-[rgba(184,255,46,0.06)]" :
            "border-white/[0.08] text-[#555]"
          }`}
        >
          {done ? "✓" : num}
        </div>
        <div className={`w-[2px] flex-1 mt-2 ${done ? "bg-[#B8FF2E]/30" : "bg-white/[0.04]"}`} />
      </div>
      <div className="pb-10">
        <h4 className={`text-sm font-bold ${done ? "text-white" : active ? "text-[#B8FF2E]" : "text-[#555]"}`}>
          {title}
        </h4>
        <p className="text-xs text-[#888] mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════ Bento Grid Feature — Origem: IA Template BentoSection ═══════════ */
export function BentoFeature({ icon, title, desc, large = false }: { icon: string; title: string; desc: string; large?: boolean }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal glass-card ${large ? "md:col-span-2 md:row-span-2" : ""}`}>
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-[#888] leading-relaxed">{desc}</p>
    </div>
  );
}

/* ═══════════ CTA Section — Origem: Banco XP glowbox + SaaS Template sticky footer ═══════════ */
export function CTASection() {
  const ref = useReveal();
  return (
    <section id="cta" className="relative py-32 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(184,255,46,0.04)] blur-[120px]" />
      </div>
      <div ref={ref} className="reveal relative z-10 max-w-xl mx-auto px-6 flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white">
          Pronto para transformar sua gestão?
        </h2>
        <p className="text-sm sm:text-base text-[#888] max-w-md leading-relaxed">
          Centralize clientes, projetos, contratos e pagamentos em uma plataforma premium com área exclusiva para cada cliente.
        </p>
        <div className="glowbox mt-2">
          <div className="glowbox-anim-layer">
            <div className="glowbox-anim-glow" />
          </div>
          <div className="glowbox-inner">
            <Link href="/auth/login" className="btn-lp btn-lp-primary relative z-[2] text-sm px-8 py-4">
              Solicitar Projeto →
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-[#555]">Resposta em até 2 horas em horário comercial</p>
      </div>
    </section>
  );
}
