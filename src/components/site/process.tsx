import { SectionHeading } from "./section-heading";

const steps = [
  { t: "Contato", d: "Você conta o que precisa pelo formulário ou pelos nossos canais." },
  { t: "Briefing", d: "Entendemos objetivos, público, referências e restrições do projeto." },
  { t: "Proposta", d: "Escopo, etapas, prazos e investimento apresentados com clareza." },
  { t: "Contrato", d: "Formalização digital, com assinatura e condições 50/50." },
  { t: "Desenvolvimento", d: "Design e código em ciclos, com entregas parciais visíveis no portal." },
  { t: "Validação", d: "Você revisa, testa e aprova cada etapa antes da publicação." },
  { t: "Entrega", d: "Publicação, documentação e repasse de acessos." },
  { t: "Suporte", d: "Acompanhamento pós-entrega, ajustes e evolução contínua." },
];

export function Process() {
  return (
    <section id="processo" className="scroll-mt-20 border-y border-border bg-surface-sunken/60 py-24 sm:py-32" aria-labelledby="processo-title">
      <div className="container">
        <SectionHeading
          index="03"
          eyebrow="Como trabalhamos"
          id="processo-title"
          title="Uma jornada clara,"
          accent="do contato ao suporte."
          description="Cada etapa tem um responsável, um entregável e um registro no Unitrix Hub — você sabe sempre em que ponto o projeto está."
        />

        <ol className="relative mt-16 grid gap-0 lg:grid-cols-8 lg:gap-4">
          {/* Linha horizontal (desktop) */}
          <span aria-hidden="true" className="absolute left-0 right-0 top-[11px] hidden h-px bg-border-strong lg:block" />
          {steps.map((s, i) => (
            <li key={s.t} className="relative grid grid-cols-[24px_1fr] gap-5 pb-10 last:pb-0 lg:block lg:pb-0">
              {/* Linha vertical (mobile) */}
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-6 w-px bg-border-strong lg:hidden" />
              )}
              <span
                aria-hidden="true"
                className={
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background " +
                  (i === 0 ? "border-accent" : "border-border-strong")
                }
              >
                <span className={"h-1.5 w-1.5 rounded-full " + (i === 0 ? "bg-accent" : "bg-foreground-dim")} />
              </span>
              <div className="lg:mt-6">
                <p className="num text-2xs text-foreground-dim">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1.5 text-[15px] font-medium">{s.t}</h3>
                <p className="mt-2 text-pretty text-[13px] leading-relaxed text-foreground-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
