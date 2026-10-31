"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

/** Credencial com valor oculto por padrão. */
export function CredentialRow({ label, value }: { label: string; value: string }) {
  const [shown, setShown] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-foreground-muted">{label}</p>
        <p className="num mt-0.5 break-all text-[13px] text-foreground">{shown ? value : "•".repeat(Math.min(12, Math.max(6, value.length)))}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={() => setShown((s) => !s)} className="rounded-md p-2 text-foreground-dim hover:bg-surface-hover hover:text-foreground" aria-label={shown ? "Ocultar" : "Mostrar"}>
          {shown ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
        </button>
        <button type="button" onClick={copy} className="rounded-md p-2 text-foreground-dim hover:bg-surface-hover hover:text-foreground" aria-label="Copiar">
          <Copy className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
