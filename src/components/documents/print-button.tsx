"use client";

import { Printer } from "lucide-react";

export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className ?? "inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-[13px] text-foreground hover:bg-surface-hover"}>
      <Printer className="h-4 w-4" strokeWidth={1.6} /> Imprimir / PDF
    </button>
  );
}
