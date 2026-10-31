"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app:error]", error.digest || error.message);
  }, [error]);

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <p className="eyebrow">Algo saiu do previsto</p>
        <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-[-0.02em]">
          Não foi possível <span className="italic text-foreground-muted">carregar esta página.</span>
        </h1>
        <p className="mt-5 text-pretty leading-relaxed text-foreground-muted">
          Ocorreu um erro inesperado. Tente novamente — se o problema continuar, volte mais tarde ou fale com a equipe Unitrix.
        </p>
        {error.digest && <p className="mt-4 font-mono text-2xs text-foreground-dim">Código: {error.digest}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw strokeWidth={1.8} /> Tentar novamente
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Ir para o início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
