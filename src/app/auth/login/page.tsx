import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/components/site/login-form";

export const metadata: Metadata = {
  title: "Área do cliente",
  description: "Acesse o Unitrix Hub para acompanhar seus projetos, contratos, apresentações e pagamentos.",
  robots: { index: true, follow: false },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Painel editorial (desktop) */}
      <aside className="grain relative hidden overflow-hidden border-r border-border bg-surface-sunken lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_30%_70%,black,transparent_75%)]" />
        <Link href="/" className="relative w-fit rounded-md" aria-label="Unitrix — voltar ao site">
          <Logo suffix="Hub" />
        </Link>
        <div className="relative max-w-lg">
          <p className="eyebrow">Área do cliente</p>
          <h2 className="mt-6 font-display text-6xl leading-[1] tracking-[-0.02em] xl:text-7xl">
            Cada etapa do seu projeto, <span className="italic text-foreground-muted">em um só lugar.</span>
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-6 text-sm text-foreground-muted">
            {["Progresso e etapas", "Contratos", "Apresentações", "Pagamentos"].map((i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-2xs uppercase tracking-[0.18em] text-foreground-dim">Unitrix · Premium Technology Studio</p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="rounded-md lg:hidden" aria-label="Unitrix — voltar ao site">
            <Logo suffix="Hub" />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md py-2 text-[13px] text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="eyebrow">Unitrix Hub</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Entrar</h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
            Use o e-mail e a senha fornecidos pela equipe Unitrix.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-[260px]" aria-hidden="true" />}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-8 text-[13px] leading-relaxed text-foreground-dim">
            Ainda não é cliente?{" "}
            <Link href="/#orcamento" className="text-foreground-muted underline underline-offset-4 hover:text-foreground">
              Solicite um projeto
            </Link>
            .
          </p>
        </div>

        <p className="text-center text-2xs text-foreground-dim lg:text-left">© {new Date().getFullYear()} Unitrix</p>
      </main>
    </div>
  );
}
