import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }: {
  icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}>
      {Icon && (
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-border bg-surface-sunken text-foreground-dim">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-foreground-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-md bg-surface-hover/60 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent", className)} />;
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-hover", className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-foreground-dim" strokeWidth={1.5} />}
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-foreground num">{value}</div>
      {hint && <div className="mt-1 text-xs text-foreground-muted">{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-foreground-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ErrorState({ title = "Não foi possível carregar", description, action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-danger/25 bg-danger/[0.06] px-5 py-6">
      <p className="text-sm font-medium text-danger">{title}</p>
      {description && <p className="mt-1 text-[13px] text-foreground-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
