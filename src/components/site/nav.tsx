"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        scrolled || open ? "border-b border-border bg-background/85 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
      >
        Pular para o conteúdo
      </a>
      <nav aria-label="Principal" className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Unitrix — início" className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-md px-3 py-2 text-[13px] text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/auth/login"
            className="rounded-md px-3 py-2 text-[13px] text-foreground-muted transition-colors hover:text-foreground"
          >
            Área do cliente
          </Link>
          <a
            href="#orcamento"
            className="group inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:bg-white"
          >
            Solicitar projeto
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={1.8} />
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.6} /> : <Menu className="h-5 w-5" strokeWidth={1.6} />}
        </button>
      </nav>

      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden"
      >
        <div className="container flex min-h-full flex-col py-8">
          <p className="eyebrow mb-4">Navegação</p>
          <ul className="divide-y divide-border border-y border-border">
            {siteConfig.nav.map((item, i) => (
              <li key={item.href}>
                <a href={item.href} onClick={close} className="flex items-baseline justify-between py-4">
                  <span className="font-display text-3xl">{item.label}</span>
                  <span className="num text-2xs text-foreground-dim">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-10">
            <a
              href="#orcamento"
              onClick={close}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-foreground text-[15px] font-medium text-background"
            >
              Solicitar projeto <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </a>
            <Link
              href="/auth/login"
              onClick={close}
              className="inline-flex h-12 items-center justify-center rounded-md border border-border text-[15px] text-foreground"
            >
              Área do cliente
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
