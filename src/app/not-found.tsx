import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="grain relative flex min-h-dvh flex-col overflow-hidden">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <header className="container relative flex h-16 items-center">
        <Link href="/" className="rounded-md" aria-label="Unitrix — início">
          <Logo />
        </Link>
      </header>
      <main className="container relative flex flex-1 flex-col items-start justify-center pb-24">
        <p className="eyebrow">Erro 404</p>
        <h1 className="mt-6 font-display text-[22vw] leading-[0.85] tracking-[-0.04em] text-foreground/90 sm:text-[11rem]">
          Perdido<span className="italic text-accent">?</span>
        </h1>
        <p className="mt-8 max-w-md text-pretty leading-relaxed text-foreground-muted">
          A página que você procura não existe, foi movida ou não está disponível para o seu acesso.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" /> Voltar ao início
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm text-foreground transition-colors hover:border-border-strong hover:bg-surface"
          >
            Área do cliente
          </Link>
        </div>
      </main>
    </div>
  );
}
