import { Faq } from "./faq";
import { SectionHeading } from "./section-heading";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border py-24 sm:py-32" aria-labelledby="faq-title">
      <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading index="07" eyebrow="Perguntas frequentes" id="faq-title" title="Antes de" accent="começarmos." align="stack" />
          <p className="mt-6 max-w-sm text-pretty leading-relaxed text-foreground-muted">
            Não encontrou o que procurava? Envie sua dúvida junto com a solicitação de orçamento.
          </p>
        </div>
        <Faq />
      </div>
    </section>
  );
}
