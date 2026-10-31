import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="px-4 pb-6 sm:px-6 lg:px-8" aria-labelledby="cta-title">
      <div className="grain relative mx-auto max-w-[1320px] overflow-hidden rounded-xl bg-paper text-paper-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgb(var(--paper-line))_1px,transparent_1px)] [background-size:80px_100%] [mask-image:linear-gradient(to_bottom,transparent,black)]"
        />
        <div className="relative grid gap-10 px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:px-16 lg:py-24">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.18em] text-paper-muted">Próximo passo</p>
            <h2 id="cta-title" className="mt-6 text-balance text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
              Vamos construir algo que{" "}
              <span className="font-display font-normal italic tracking-[-0.01em] text-accent-deep">faça diferença.</span>
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-sm text-pretty leading-relaxed text-paper-muted">
              Conte sua ideia em poucos minutos. Respondemos com os próximos passos e um caminho claro até a entrega.
            </p>
            <a
              href="#orcamento"
              className="group mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-paper-ink px-6 text-[15px] font-medium text-paper transition-colors hover:bg-black"
            >
              Solicitar projeto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
