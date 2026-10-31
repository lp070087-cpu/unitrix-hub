"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, GitBranch } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const codeLines = [
  { w: "w-[62%]", tone: "bg-accent/50", indent: 0 },
  { w: "w-[48%]", tone: "bg-foreground/15", indent: 1 },
  { w: "w-[70%]", tone: "bg-foreground/10", indent: 2 },
  { w: "w-[38%]", tone: "bg-info/40", indent: 2 },
  { w: "w-[55%]", tone: "bg-foreground/10", indent: 1 },
  { w: "w-[30%]", tone: "bg-warning/35", indent: 1 },
  { w: "w-[44%]", tone: "bg-foreground/15", indent: 0 },
];

/** Composição ilustrativa construída em código — sem imagens externas. */
export function HeroVisual() {
  const reduce = useReducedMotion();
  const float = (delay: number, distance = 6) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -distance, 0] },
          transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden="true">
      {/* Janela principal */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.15 }}
        className="relative overflow-hidden rounded-xl border border-border-strong/70 bg-surface shadow-lift"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="ml-3 truncate rounded-sm bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-foreground-dim">
            studio / projeto / interface.tsx
          </span>
        </div>

        <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[52px_1fr_150px]">
          {/* Rail */}
          <div className="flex flex-col items-center gap-3 border-r border-border py-4">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i === 1 ? "h-6 w-6 rounded-md bg-accent/20 ring-1 ring-accent/40" : "h-6 w-6 rounded-md bg-foreground/[0.06]"} />
            ))}
          </div>

          {/* Editor */}
          <div className="min-w-0 space-y-2.5 p-4 sm:p-5">
            {codeLines.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="num w-4 shrink-0 text-right text-[10px] text-foreground-dim/70">{i + 1}</span>
                <motion.span
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, ease, delay: 0.5 + i * 0.08 }}
                  style={{ marginLeft: l.indent * 14, transformOrigin: "left" }}
                  className={`block h-2 rounded-full ${l.w} ${l.tone}`}
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="num w-4 shrink-0 text-right text-[10px] text-foreground-dim/70">8</span>
              <motion.span
                className="block h-3.5 w-[2px] bg-accent"
                animate={reduce ? undefined : { opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Inspector */}
          <div className="hidden border-l border-border p-4 sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground-dim">Layout</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={i === 4 ? "aspect-square rounded-sm bg-accent/30" : "aspect-square rounded-sm bg-foreground/[0.06]"} />
              ))}
            </div>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-foreground-dim">Tipografia</p>
            <p className="mt-2 font-display text-3xl leading-none text-foreground">Aa</p>
            <div className="mt-3 space-y-1.5">
              <span className="block h-1.5 w-full rounded-full bg-foreground/10" />
              <span className="block h-1.5 w-2/3 rounded-full bg-foreground/10" />
            </div>
          </div>
        </div>

        {/* Preview bar */}
        <div className="border-t border-border bg-surface-sunken/60 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between font-mono text-[10px] text-foreground-dim">
            <span>Build de produção</span>
            <span className="num text-foreground-muted">compilando…</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/[0.07]">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={reduce ? { width: "86%" } : { width: "8%" }}
              animate={{ width: "86%" }}
              transition={{ duration: 2.4, ease, delay: 0.8 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Cartão flutuante: deploy */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 1.1 }}
        className="absolute -bottom-6 left-3 sm:-left-6"
      >
        <motion.div {...float(0)} className="flex items-center gap-3 rounded-lg border border-border-strong/70 bg-surface-raised/95 px-3.5 py-2.5 shadow-lift backdrop-blur">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-[12px] font-medium text-foreground">Versão publicada</span>
            <span className="block font-mono text-[10px] text-foreground-dim">ambiente de produção</span>
          </span>
        </motion.div>
      </motion.div>

      {/* Cartão flutuante: branch */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 1.3 }}
        className="absolute -top-5 right-3 sm:-right-5"
      >
        <motion.div {...float(1.5, 5)} className="flex items-center gap-2 rounded-full border border-border-strong/70 bg-surface-raised/95 px-3 py-1.5 shadow-lift backdrop-blur">
          <GitBranch className="h-3.5 w-3.5 text-accent" strokeWidth={1.6} />
          <span className="font-mono text-[10px] text-foreground-muted">feature/experiencia</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
