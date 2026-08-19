"use client";
// Origem: Banco XP (círculos animados + glowbox) + IA Template (SVG grid) + SaaS Template (stagger reveal)

import { useEffect, useRef } from "react";
import Link from "next/link";

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Stagger reveal — Origem: SaaS Template
    const els = sectionRef.current?.querySelectorAll(".hero-reveal");
    els?.forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), 100 + i * 120);
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Banco XP: Círculos animados com blur ── */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#B8FF2E]/[0.04] rounded-full blur-[150px]" style={{ animation: "move1 25s ease-in-out infinite alternate" }} />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#B8FF2E]/[0.03] rounded-full blur-[120px]" style={{ animation: "move2 30s ease-in-out infinite alternate" }} />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#B8FF2E]/[0.02] rounded-full blur-[200px]" style={{ animation: "move3 35s ease-in-out infinite alternate" }} />

      {/* ── IA Template: SVG grid background ── */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B8FF2E" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-grid)" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="hero-reveal reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(184,255,46,0.15)] bg-[rgba(184,255,46,0.04)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF2E] shadow-[0_0_8px_rgba(184,255,46,0.6)]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#B8FF2E] uppercase">Plataforma Premium</span>
        </div>

        {/* Título — Origem: SaaS Template stagger reveal */}
        <h1 className="hero-reveal reveal text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.9] text-white max-w-3xl">
          Gestão completa de{" "}
          <span className="text-[#B8FF2E]">projetos e clientes</span>
        </h1>

        <p className="hero-reveal reveal text-base sm:text-lg text-[#888] max-w-xl leading-relaxed">
          Contratos, apresentações, pagamentos, prazos de entrega e suporte — tudo centralizado em uma plataforma premium com área exclusiva para cada cliente.
        </p>

        {/* CTAs — Origem: Banco XP glowbox */}
        <div className="hero-reveal reveal flex flex-wrap items-center gap-3 justify-center">
          <div className="glowbox">
            <div className="glowbox-anim-layer">
              <div className="glowbox-anim-glow" />
            </div>
            <div className="glowbox-inner">
              <Link href="/auth/login" className="btn-lp btn-lp-primary relative z-[2]">
                Conhecer o Sistema →
              </Link>
            </div>
          </div>
          <a href="#solucao" className="btn-lp btn-lp-ghost">
            Ver Funcionalidades
          </a>
        </div>

        {/* Stats row — Origem: Iron Man SystemsNominal */}
        <div className="hero-reveal reveal grid grid-cols-3 gap-8 sm:gap-16 mt-8 pt-8 border-t border-white/[0.06]">
          {[
            { value: "100%", label: "Contratos Digitais" },
            { value: "24/7", label: "Suporte Premium" },
            { value: "R$ 5K+", label: "Projetos Mínimos" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-[#555] uppercase tracking-[0.15em] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
