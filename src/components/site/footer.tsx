import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { siteConfig, formatWhatsapp } from "@/lib/site-config";

export function SiteFooter() {
  const { email, whatsapp, whatsappUrl, instagram } = siteConfig.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden pt-16">
      <div className="container">
        <div className="grid gap-12 border-b border-border pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-foreground-muted">
              Estúdio de tecnologia. Websites, plataformas, sistemas e experiências digitais sob medida.
            </p>
          </div>
          <nav aria-label="Rodapé">
            <p className="eyebrow mb-4">Navegação</p>
            <ul className="space-y-2.5 text-sm">
              {siteConfig.nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-foreground-muted transition-colors hover:text-foreground">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#orcamento" className="text-foreground-muted transition-colors hover:text-foreground">
                  Solicitar projeto
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="text-foreground-muted transition-colors hover:text-foreground">
                  Área do cliente
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-4">Contato</p>
            <ul className="space-y-2.5 text-sm">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="break-all text-foreground-muted transition-colors hover:text-foreground">
                    {email}
                  </a>
                </li>
              )}
              {whatsapp && whatsappUrl && (
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-foreground-muted transition-colors hover:text-foreground">
                    WhatsApp {formatWhatsapp(whatsapp)}
                  </a>
                </li>
              )}
              {instagram && (
                <li>
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-foreground-muted transition-colors hover:text-foreground">
                    Instagram
                  </a>
                </li>
              )}
              <li>
                <a href="#orcamento" className="text-foreground-muted transition-colors hover:text-foreground">
                  Formulário de orçamento
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="select-none whitespace-nowrap pt-10 text-center font-display text-[24vw] leading-[0.8] tracking-[-0.04em] text-foreground/[0.06] lg:text-[17rem]"
        >
          Unitrix
        </p>

        <div className="flex flex-col gap-2 border-t border-border py-6 text-xs text-foreground-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Unitrix. Todos os direitos reservados.</p>
          <p className="font-mono uppercase tracking-[0.14em]">{siteConfig.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
