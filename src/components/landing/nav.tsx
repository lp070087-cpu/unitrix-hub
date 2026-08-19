"use client";
// Origem: SaaS Template glass header + Iron Man scroll-aware nav

import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { href: "#problema", label: "Problema" },
  { href: "#solucao", label: "Solução" },
  { href: "#demo", label: "Demo" },
  { href: "#timeline", label: "Timeline" },
  { href: "#fluxo", label: "Fluxo" },
  { href: "#diferenciais", label: "Diferenciais" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= (s as HTMLElement).offsetTop - 200) {
          current = s.id;
        }
      });
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 rounded-full border shadow-lg ${
          scrolled
            ? "max-w-3xl bg-[#0E0E11]/85 backdrop-blur-xl border-white/[0.08]"
            : "max-w-xl bg-[#0E0E11]/70 backdrop-blur-md border-white/[0.05]"
        }`}
        style={{ transform: "translateX(-50%) translateZ(0)", backfaceVisibility: "hidden" }}
      >
        <div className="flex items-center gap-1 px-3 py-2">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0">
            <svg viewBox="0 0 200 200" className="w-5 h-5">
              <line x1="32" y1="100" x2="168" y2="100" stroke="#B8FF2E" strokeWidth="5" strokeLinecap="round" />
              <line x1="46.5" y1="150" x2="153.5" y2="50" stroke="#B8FF2E" strokeWidth="5" strokeLinecap="round" />
              <line x1="46.5" y1="50" x2="153.5" y2="150" stroke="#B8FF2E" strokeWidth="5" strokeLinecap="round" />
              <circle cx="100" cy="100" r="9" fill="#B8FF2E" />
            </svg>
            <span className="font-black text-xs tracking-tight text-white hidden sm:inline">
              Unitri<span className="text-[#B8FF2E]">x</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 tracking-wide ${
                  active === l.href.slice(1)
                    ? "text-[#B8FF2E] bg-[rgba(184,255,46,0.08)]"
                    : "text-[#888] hover:text-[#E8E8E8] hover:bg-white/[0.04]"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/auth/login"
            className="ml-auto px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-[#B8FF2E] border border-[rgba(184,255,46,0.2)] hover:bg-[rgba(184,255,46,0.06)] transition-all flex-shrink-0"
          >
            Acessar Hub
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 flex flex-col gap-1 group"
            aria-label="Menu"
          >
            <span className={`block w-4 h-[1.5px] bg-white rounded transition-all ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block w-4 h-[1.5px] bg-white rounded transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-4 h-[1.5px] bg-white rounded transition-all ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9998] bg-[#08080A]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-xl font-semibold text-white hover:text-[#B8FF2E] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-3 rounded-full text-sm font-bold bg-[#B8FF2E] text-[#08080A]"
          >
            Acessar Hub
          </Link>
        </div>
      )}
    </>
  );
}
