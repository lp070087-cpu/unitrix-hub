"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimelinePrazoProps {
  startDate: string | Date | null | undefined;
  endDate: string | Date | null | undefined;
  label?: string;
  showDays?: boolean;
  /** Projeto concluído/entregue: não sinaliza atraso. */
  completed?: boolean;
  className?: string;
}

const DAY = 86_400_000;
const fmt = (d: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(d));

/** Linha do tempo do prazo: decorrido x total, com marcador de hoje. */
export function TimelinePrazo({ startDate, endDate, label = "Prazo", showDays = true, completed, className }: TimelinePrazoProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!startDate || !endDate) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="eyebrow">{label}</span>
        </div>
        <p className="text-[13px] text-foreground-dim">Prazo ainda não definido.</p>
      </div>
    );
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const total = Math.max(DAY, end - start);
  const pct = Math.min(100, Math.max(0, ((now - start) / total) * 100));
  const daysTotal = Math.max(1, Math.round(total / DAY));
  const daysLeft = Math.ceil((end - now) / DAY);
  const late = !completed && now > end;
  const notStarted = now < start;

  let status: string;
  if (completed) status = "Concluído";
  else if (late) status = `${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "dia" : "dias"} de atraso`;
  else if (notStarted) status = `Começa em ${Math.ceil((start - now) / DAY)} dias`;
  else status = daysLeft <= 0 ? "Entrega hoje" : `${daysLeft} ${daysLeft === 1 ? "dia restante" : "dias restantes"}`;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{label}</span>
        {showDays && (
          <span className={cn("text-xs num", late ? "text-danger" : completed ? "text-success" : "text-foreground-muted")}>{status}</span>
        )}
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-surface-hover" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", late ? "bg-danger/70" : completed ? "bg-success/70" : "bg-accent")}
          style={{ width: `${completed ? 100 : pct}%` }}
        />
        {!completed && !late && !notStarted && (
          <span className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-foreground/70" style={{ left: `${pct}%` }} aria-hidden />
        )}
      </div>
      <div className="flex items-center justify-between text-2xs text-foreground-dim num">
        <span>{fmt(start)}</span>
        {showDays && <span className="hidden sm:inline">{daysTotal} dias</span>}
        <span>{fmt(end)}</span>
      </div>
    </div>
  );
}
