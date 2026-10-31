import { ArrowRight, ArrowDown } from "lucide-react";
import { HeroVisual } from "./hero-visual";

const capabilities = [
  "Websites", "Landing pages", "E-commerce", "Sistemas sob medida", "SaaS", "Aplicativos & PWA",
  "Automações", "Inteligência artificial", "Integrações", "Infraestrutura", "Painéis administrativos", "Portal do cliente",
];

export function Hero() {
  return (
    <section className="grain relative overflow-hidden pt-16" aria-labelledby="hero-title">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_30%,black,transparent_70%)]" />

      <div className="container relative grid items-center gap-16 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.08fr_1fr] lg:gap-12 lg:pb-28 lg:pt-28">
        <div className="animate-slide-up">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" />
            Estúdio de tecnologia · Brasil
          </p>
          <h1 id="hero-title" className="mt-7 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.4rem]">
            Tecnologia sob medida para negócios que querem{" "}
            <span className="font-display font-normal italic tracking-[-0.01em] text-accent">ir além.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-[17px] leading-relaxed text-foreground-muted sm:text-lg">
            Desenvolvemos websites, plataformas, sistemas inteligentes e experiências digitais que transformam ideias em soluções reais.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#orcamento"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-[15px] font-medium text-background transition-colors hover:bg-white"
            >
              Solicitar projeto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
            </a>
            <a
              href="#servicos"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-[15px] text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              Conhecer nossos serviços
              <ArrowDown className="h-4 w-4 text-foreground-dim transition-transform group-hover:translate-y-0.5" strokeWidth={1.6} />
            </a>
          </div>
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              ["Escopo", "Sob medida"],
              ["Pagamento", "50 / 50"],
              ["Acompanhamento", "Portal do cliente"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-2 text-[13px] text-foreground sm:text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="px-1 sm:px-6 lg:px-0">
          <HeroVisual />
        </div>
      </div>

      {/* Marquee de capacidades */}
      <div className="relative overflow-hidden border-y border-border bg-surface-sunken/50 py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="sr-only">
          {capabilities.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div aria-hidden="true" className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {capabilities.map((c) => (
                <span key={c} className="flex items-center gap-6 pr-6 text-[13px] text-foreground-muted">
                  <span className="whitespace-nowrap">{c}</span>
                  <span className="h-1 w-1 rounded-full bg-accent/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
