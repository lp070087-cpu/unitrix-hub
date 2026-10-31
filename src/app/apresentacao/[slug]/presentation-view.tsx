"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Check, CheckCircle2, Loader2, LogIn } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import type { PresentationContent, PresentationSection } from "@/lib/presentations/types";
import { acceptPresentation } from "./actions";

export type Viewer = "admin" | "owner" | "anon" | "other";

type Theme = { root: string; muted: string; dim: string; line: string; card: string; accent: string; nav: string; btn: string };
const THEMES: Record<"dark" | "paper", Theme> = {
  dark: {
    root: "bg-background text-foreground",
    muted: "text-foreground-muted",
    dim: "text-foreground-dim",
    line: "border-border",
    card: "bg-surface border-border",
    accent: "text-accent",
    nav: "bg-background/80 border-border",
    btn: "bg-accent text-accent-fg hover:bg-accent-hover",
  },
  paper: {
    root: "bg-paper text-paper-ink",
    muted: "text-paper-muted",
    dim: "text-paper-muted",
    line: "border-paper-line",
    card: "bg-white/60 border-paper-line",
    accent: "text-accent-deep",
    nav: "bg-paper/85 border-paper-line",
    btn: "bg-paper-ink text-paper hover:opacity-90",
  },
};

function isEmpty(s: PresentationSection) {
  return !s.title.trim() && !(s.body ?? "").trim() && !(s.items ?? []).some((i) => i.title.trim() || i.description.trim()) && s.amount == null && !(s.notes ?? "").trim();
}

function Paragraphs({ text, className }: { text?: string; className?: string }) {
  const parts = (text ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  return (
    <div className={cn("space-y-4", className)}>
      {parts.map((p, i) => <p key={i} className="whitespace-pre-line text-pretty">{p}</p>)}
    </div>
  );
}

export function PresentationView({ slug, status, content, clientLabel, viewer, accepted }: {
  slug: string; status: string; content: PresentationContent; clientLabel: string; viewer: Viewer; accepted: { at: string; by: string } | null;
}) {
  const reduce = useReducedMotion();
  const t = THEMES[content.theme ?? "dark"];
  const sections = useMemo(() => content.sections.filter((s) => !isEmpty(s)), [content.sections]);
  const canDecide = status === "SENT" || status === "VIEWED" || status === "ACCEPTED";
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const fadeUp: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
  const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: reduce ? 0 : 0.15 } } };

  return (
    <div className={cn("min-h-dvh", t.root)}>
      {viewer === "admin" && status !== "SENT" && status !== "VIEWED" && status !== "ACCEPTED" && (
        <div className="bg-warning/15 px-4 py-2 text-center text-xs">Pré-visualização administrativa · status atual não é visível para o cliente.</div>
      )}

      <header className={cn("sticky top-0 z-30 border-b backdrop-blur-xl", t.nav)}>
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo className={content.theme === "paper" ? "text-paper-ink" : undefined} />
          <nav aria-label="Seções" className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn("whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] transition-colors", active === s.id ? t.accent : cn(t.muted, "hover:opacity-100"))}
              >
                <span className="num mr-1.5 text-[11px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {s.title || "Seção"}
              </a>
            ))}
          </nav>
          {canDecide && (
            <a href="#aprovacao" className={cn("hidden shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium sm:inline-flex", t.btn)}>
              {status === "ACCEPTED" ? "Aprovada" : "Aprovar"}
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden grain">
        <div className={cn("pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]", content.theme === "paper" ? "" : "hairline-grid")} aria-hidden />
        <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-24">
          <motion.p variants={fadeUp} className={cn("font-mono text-2xs uppercase tracking-[0.2em]", t.dim)}>
            {content.hero.eyebrow || `Proposta para ${clientLabel}`}
          </motion.p>
          <motion.h1 variants={fadeUp} className="display mt-6 max-w-5xl text-[44px] text-balance sm:text-[76px] lg:text-[104px]">
            {content.hero.title}
          </motion.h1>
          {content.hero.subtitle && (
            <motion.p variants={fadeUp} className={cn("mt-8 max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl", t.muted)}>
              {content.hero.subtitle}
            </motion.p>
          )}
          <motion.div variants={fadeUp} className={cn("mt-12 flex items-center gap-3 border-t pt-6 text-xs", t.line, t.dim)}>
            <span className="font-mono uppercase tracking-[0.16em]">Unitrix</span>
            <span aria-hidden>·</span>
            <span>{clientLabel}</span>
            <span aria-hidden>·</span>
            <span>{sections.length} seções</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Seções */}
      <main>
        {sections.map((s, i) => (
          <motion.section
            key={s.id}
            id={s.id}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn("scroll-mt-16 border-t", t.line)}
          >
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <SectionBody section={s} index={i} t={t} />
            </div>
          </motion.section>
        ))}

        {sections.length === 0 && (
          <div className={cn("mx-auto max-w-6xl border-t px-4 py-24 text-center sm:px-6", t.line, t.muted)}>Conteúdo em preparação.</div>
        )}

        {canDecide && (
          <section id="aprovacao" className={cn("scroll-mt-16 border-t", t.line)}>
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <AcceptBlock slug={slug} status={status} viewer={viewer} accepted={accepted} t={t} />
            </div>
          </section>
        )}
      </main>

      <footer className={cn("border-t", t.line)}>
        <div className={cn("mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6", t.dim)}>
          <span>Documento confidencial preparado pela Unitrix para {clientLabel}.</span>
          <span className="font-mono uppercase tracking-[0.16em]">Unitrix · Tecnologia sob medida</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ index, title, t, className }: { index: number; title: string; t: Theme; className?: string }) {
  return (
    <div className={className}>
      <p className={cn("font-mono text-2xs uppercase tracking-[0.2em]", t.dim)}>{String(index + 1).padStart(2, "0")}</p>
      {title && <h2 className="display mt-4 text-[36px] text-balance sm:text-[52px]">{title}</h2>}
    </div>
  );
}

function SectionBody({ section: s, index, t }: { section: PresentationSection; index: number; t: Theme }) {
  const items = (s.items ?? []).filter((i) => i.title.trim() || i.description.trim());

  if (s.type === "text") {
    return (
      <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <SectionHead index={index} title={s.title} t={t} />
        <Paragraphs text={s.body} className={cn("text-lg leading-relaxed lg:pt-10", t.muted)} />
      </div>
    );
  }

  if (s.type === "features") {
    return (
      <div>
        <SectionHead index={index} title={s.title} t={t} className="max-w-3xl" />
        <ul className={cn("mt-14 grid border-l border-t sm:grid-cols-2 lg:grid-cols-3", t.line)}>
          {items.map((it, i) => (
            <li key={i} className={cn("border-b border-r p-6 sm:p-8", t.line, i === 0 && items.length > 2 && "lg:col-span-2")}>
              <span className={cn("num text-xs", t.accent)}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={cn("mt-6 font-medium tracking-[-0.01em]", i === 0 && items.length > 2 ? "text-2xl" : "text-lg")}>{it.title}</h3>
              {it.description && <p className={cn("mt-3 leading-relaxed text-pretty", t.muted)}>{it.description}</p>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (s.type === "timeline") {
    return (
      <div className="grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16">
        <SectionHead index={index} title={s.title} t={t} className="lg:sticky lg:top-24 lg:self-start" />
        <ol className={cn("relative border-l pl-8 sm:pl-10", t.line)}>
          {items.map((it, i) => (
            <li key={i} className="relative pb-12 last:pb-0">
              <span className={cn("absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 sm:-left-[calc(2.5rem+5px)]", i === 0 ? "border-accent bg-accent" : cn(t.line, "bg-current opacity-40"))} aria-hidden />
              <p className={cn("num text-xs", t.dim)}>Etapa {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-xl font-medium tracking-[-0.01em]">{it.title}</h3>
              {it.description && <p className={cn("mt-2 max-w-xl leading-relaxed text-pretty", t.muted)}>{it.description}</p>}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (s.type === "investment") {
    return (
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div>
          <SectionHead index={index} title={s.title} t={t} />
          {s.amount != null && (
            <p className="mt-10">
              <span className={cn("block font-mono text-2xs uppercase tracking-[0.2em]", t.dim)}>Investimento total</span>
              <span className="display num mt-3 block text-[48px] sm:text-[80px]">{formatCurrency(s.amount)}</span>
            </p>
          )}
          <Paragraphs text={s.body} className={cn("mt-8 max-w-xl text-lg leading-relaxed", t.muted)} />
        </div>
        <div className={cn("rounded-lg border p-6 sm:p-8 lg:mt-10", t.card)}>
          {items.length > 0 && (
            <>
              <p className={cn("font-mono text-2xs uppercase tracking-[0.2em]", t.dim)}>Incluso</p>
              <ul className="mt-5 space-y-4">
                {items.map((it, i) => (
                  <li key={i} className="flex gap-3">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", t.accent)} strokeWidth={1.8} />
                    <div>
                      <p className="font-medium">{it.title}</p>
                      {it.description && <p className={cn("mt-1 text-sm leading-relaxed", t.muted)}>{it.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {s.notes && <Paragraphs text={s.notes} className={cn("text-sm leading-relaxed", items.length > 0 && cn("mt-6 border-t pt-6", t.line), t.muted)} />}
          {!items.length && !s.notes && <p className={cn("text-sm", t.muted)}>Condições detalhadas no contrato.</p>}
        </div>
      </div>
    );
  }

  // cta
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={cn("font-mono text-2xs uppercase tracking-[0.2em]", t.dim)}>{String(index + 1).padStart(2, "0")}</p>
      {s.title && <h2 className="display mt-4 text-[40px] text-balance sm:text-[64px]">{s.title}</h2>}
      <Paragraphs text={s.body} className={cn("mt-6 text-lg leading-relaxed", t.muted)} />
      <a href="#aprovacao" className={cn("mt-10 inline-flex items-center gap-2 text-sm font-medium", t.accent)}>
        Seguir para aprovação <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
      </a>
    </div>
  );
}

function AcceptBlock({ slug, status, viewer, accepted, t }: { slug: string; status: string; viewer: Viewer; accepted: { at: string; by: string } | null; t: Theme }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (status === "ACCEPTED" && accepted) {
    return (
      <div className={cn("mx-auto flex max-w-2xl flex-col items-center rounded-lg border px-6 py-12 text-center", t.card)}>
        <CheckCircle2 className={cn("h-8 w-8", t.accent)} strokeWidth={1.4} />
        <h2 className="display mt-5 text-[36px]">Proposta aprovada</h2>
        <p className={cn("mt-3 text-sm", t.muted)}>Aprovada por {accepted.by} em {formatDateTime(accepted.at)}. A equipe Unitrix dará sequência aos próximos passos.</p>
      </div>
    );
  }

  function approve() {
    start(async () => {
      const res = await acceptPresentation(slug);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
        return;
      }
      toast.success(res.message ?? "Proposta aprovada");
      router.refresh();
    });
  }

  return (
    <div className={cn("mx-auto max-w-2xl rounded-lg border px-6 py-12 text-center sm:px-12", t.card)}>
      <p className={cn("font-mono text-2xs uppercase tracking-[0.2em]", t.dim)}>Decisão</p>
      <h2 className="display mt-4 text-[36px] sm:text-[48px]">Aprovar esta proposta</h2>
      <p className={cn("mx-auto mt-4 max-w-md text-sm leading-relaxed", t.muted)}>
        A aprovação registra data, hora e IP e sinaliza à Unitrix que podemos preparar o contrato. Ela não substitui a assinatura do contrato.
      </p>
      <div className="mt-8 flex justify-center">
        {viewer === "owner" ? (
          <button type="button" onClick={approve} disabled={pending} className={cn("inline-flex h-11 items-center gap-2 rounded-md px-6 text-[15px] font-medium transition disabled:opacity-50", t.btn)}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={1.8} />} Aprovar proposta
          </button>
        ) : viewer === "anon" ? (
          <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/apresentacao/${slug}`)}`} className={cn("inline-flex h-11 items-center gap-2 rounded-md px-6 text-[15px] font-medium", t.btn)}>
            <LogIn className="h-4 w-4" strokeWidth={1.6} /> Entrar para aprovar
          </Link>
        ) : viewer === "admin" ? (
          <p className={cn("text-sm", t.muted)}>Visualização administrativa — apenas o cliente titular pode aprovar.</p>
        ) : (
          <p className={cn("text-sm", t.muted)}>Para aprovar, entre com a conta do cliente destinatário desta proposta.</p>
        )}
      </div>
    </div>
  );
}
