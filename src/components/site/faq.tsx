"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Como funciona o desenvolvimento?",
    a: "Começamos com um briefing para entender objetivos e requisitos. Em seguida apresentamos uma proposta com escopo e etapas. Após a contratação, o projeto avança em ciclos de design e desenvolvimento, com entregas parciais que você acompanha e valida pelo Unitrix Hub.",
  },
  {
    q: "Qual é o prazo de um projeto?",
    a: "Os prazos dependem do escopo, da complexidade e da agilidade nas validações. Uma landing page tem um ritmo muito diferente de uma plataforma com integrações. O cronograma de cada etapa é definido na proposta, antes de qualquer contratação.",
  },
  {
    q: "Quanto custa?",
    a: "Não trabalhamos com preços fixos de tabela. Cada orçamento é personalizado e elaborado após o briefing, considerando escopo, funcionalidades, integrações e prazo. Assim você paga pelo que o seu projeto realmente precisa.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Adotamos o modelo 50/50: 50% na contratação, para início do projeto, e 50% na entrega/liberação final. As condições ficam registradas no contrato e os pagamentos podem ser acompanhados no portal do cliente.",
  },
  {
    q: "Vocês cuidam da hospedagem?",
    a: "Sim. Podemos configurar hospedagem, domínio, certificado SSL, e-mails e rotinas de deploy, ou publicar na infraestrutura que você já utiliza. A recomendação depende das necessidades do projeto.",
  },
  {
    q: "Existe suporte após a entrega?",
    a: "Sim. Após a entrega oferecemos suporte técnico para dúvidas e correções, e planos de acompanhamento para quem deseja manutenção e evolução contínua. As condições são definidas conforme o projeto.",
  },
  {
    q: "E se eu precisar de funcionalidades adicionais?",
    a: "Novas funcionalidades podem ser incluídas a qualquer momento. Avaliamos o impacto no escopo e no prazo e apresentamos um orçamento complementar antes de iniciar, para que tudo fique transparente.",
  },
  {
    q: "Como é feita a entrega?",
    a: "Na entrega publicamos a solução, repassamos acessos e documentação essencial e registramos tudo no Unitrix Hub. O saldo final é liberado após a sua validação.",
  },
];

export function Faq() {
  return (
    <Accordion.Root type="single" collapsible className="border-t border-border">
      {faqs.map((f, i) => (
        <Accordion.Item key={f.q} value={`item-${i}`} className="border-b border-border">
          <Accordion.Header asChild>
            <h3>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] font-medium text-foreground transition-colors hover:text-foreground sm:py-6 sm:text-base">
                <span className="flex items-baseline gap-4">
                  <span className="num text-2xs text-foreground-dim">{String(i + 1).padStart(2, "0")}</span>
                  {f.q}
                </span>
                <Plus
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-foreground-dim transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-accent"
                  strokeWidth={1.6}
                />
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <p className="max-w-2xl pb-6 pl-8 text-pretty text-sm leading-relaxed text-foreground-muted sm:pl-9">{f.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
