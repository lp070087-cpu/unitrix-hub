import { Mail, MessageCircle, Instagram } from "lucide-react";
import { siteConfig, formatWhatsapp } from "@/lib/site-config";
import { LeadForm } from "./lead-form";
import { SectionHeading } from "./section-heading";

const next = [
  "Lemos sua solicitação e, se necessário, pedimos detalhes.",
  "Agendamos uma conversa de briefing.",
  "Enviamos uma proposta com escopo, prazo e investimento.",
];

export function LeadSection() {
  const { email, whatsapp, whatsappUrl, instagram } = siteConfig.contact;
  const hasContact = Boolean(email || whatsapp || instagram);

  return (
    <section id="orcamento" className="scroll-mt-20 py-24 sm:py-32" aria-labelledby="orcamento-title">
      <div className="container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading index="06" eyebrow="Orçamento" id="orcamento-title" title="Conte sobre o seu" accent="próximo projeto." align="stack" />
          <p className="mt-6 max-w-md text-pretty leading-relaxed text-foreground-muted">
            Cada orçamento é personalizado. Quanto mais contexto você compartilhar, mais precisa será a nossa proposta.
          </p>

          <div className="mt-10">
            <p className="eyebrow mb-4">O que acontece depois</p>
            <ol className="space-y-4">
              {next.map((n, i) => (
                <li key={n} className="flex gap-4 text-sm text-foreground-muted">
                  <span className="num pt-px text-2xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {n}
                </li>
              ))}
            </ol>
          </div>

          {hasContact && (
            <div className="mt-10 border-t border-border pt-8">
              <p className="eyebrow mb-4">Ou fale diretamente</p>
              <ul className="space-y-3 text-sm">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="inline-flex items-center gap-3 text-foreground-muted transition-colors hover:text-foreground">
                      <Mail className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {email}
                    </a>
                  </li>
                )}
                {whatsapp && whatsappUrl && (
                  <li>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-foreground-muted transition-colors hover:text-foreground">
                      <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {formatWhatsapp(whatsapp)}
                    </a>
                  </li>
                )}
                {instagram && (
                  <li>
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-foreground-muted transition-colors hover:text-foreground">
                      <Instagram className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="relative rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-8">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
