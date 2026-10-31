import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { portfolio, type PortfolioItem } from "@/lib/site-config";
import { SectionHeading } from "./section-heading";

const segments = ["Serviços profissionais", "Varejo e e-commerce", "Educação", "Saúde", "Indústria", "Startups"];

function CurationBlock() {
  return (
    <div className="grain relative mt-16 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:p-14">
        <div>
          <p className="eyebrow">Em curadoria</p>
          <h3 className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl">
            Portfólio em curadoria — <span className="italic text-foreground-muted">solicite cases por segmento.</span>
          </h3>
          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-foreground-muted">
            Muitos dos nossos projetos envolvem sistemas internos e dados sob confidencialidade. Por isso apresentamos cases
            sob demanda, alinhados ao seu segmento e ao tipo de solução que você procura.
          </p>
          <a
            href="#orcamento"
            className="group mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-white"
          >
            Solicitar cases
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
          </a>
        </div>
        <div className="self-end">
          <p className="eyebrow mb-4">Segmentos de interesse</p>
          <ul className="divide-y divide-border border-y border-border">
            {segments.map((s, i) => (
              <li key={s} className="flex items-center justify-between py-3 text-sm text-foreground-muted">
                {s}
                <span className="num text-2xs text-foreground-dim">{String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface-sunken">
        {item.image ? (
          <Image
            src={item.image}
            alt={`Projeto ${item.name}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="hairline-grid absolute inset-0 flex items-center justify-center opacity-60">
            <span className="font-display text-5xl text-foreground-dim">{item.name.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{item.category}</p>
            <h3 className="mt-2 text-xl font-medium tracking-[-0.015em]">{item.name}</h3>
          </div>
          {item.url && <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-foreground-dim transition-colors group-hover:text-foreground" strokeWidth={1.5} />}
        </div>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground-muted">{item.description}</p>
      </div>
    </>
  );
  const cls = "group block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-strong";
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${item.name} — abrir projeto em nova aba`}>
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}

export function Portfolio() {
  return (
    <section id="portfolio" className="scroll-mt-20 py-24 sm:py-32" aria-labelledby="portfolio-title">
      <div className="container">
        <SectionHeading
          index="02"
          eyebrow="Portfólio"
          id="portfolio-title"
          title="Trabalho feito com"
          accent="critério e cuidado."
          description="Projetos reais, apresentados com autorização dos clientes."
        />
        {portfolio.length === 0 ? (
          <CurationBlock />
        ) : (
          <ul className="mt-16 grid gap-4 md:grid-cols-2">
            {portfolio.map((item) => (
              <li key={item.name}>
                <PortfolioCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
