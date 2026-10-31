import { cn } from "@/lib/utils";

/** Símbolo Unitrix — três eixos em equilíbrio. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-6 w-6", className)} aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.22" />
      <path d="M8 16h16M10.5 22.5l11-13M10.5 9.5l11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="rgb(var(--accent))" />
    </svg>
  );
}

export function Logo({ className, suffix }: { className?: string; suffix?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Unitrix{suffix && <span className="ml-1.5 font-normal text-foreground-dim">{suffix}</span>}
      </span>
    </span>
  );
}
