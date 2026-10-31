import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

/* ── Mini-visuais em código (decorativos) ─────────────────────────────── */

function VisualWebsite() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-sunken">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        <span className="ml-2 h-2 w-28 rounded-sm bg-foreground/[0.06]" />
      </div>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 p-4">
        <div>
          <span className="block font-display text-2xl leading-none text-foreground/90">Sua marca,</span>
          <span className="block font-display text-2xl italic leading-tight text-foreground-dim">bem contada.</span>
          <div className="mt-3 space-y-1.5">
            <span className="block h-1.5 w-full rounded-full bg-foreground/10" />
            <span className="block h-1.5 w-4/5 rounded-full bg-foreground/10" />
          </div>
          <span className="mt-3 inline-block h-5 w-16 rounded-sm bg-foreground/80" />
        </div>
        <div className="grid grid-rows-2 gap-2">
          <span className="rounded-sm bg-gradient-to-br from-accent/25 to-accent-deep/10" />
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-sm bg-foreground/[0.06]" />
            <span className="rounded-sm bg-foreground/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualLanding() {
  const bars = [28, 42, 38, 56, 64, 82];
  return (
    <div className="flex h-28 items-end gap-2 border-b border-border pb-px">
      {bars.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%` }}
          className={cn(
            "flex-1 rounded-t-sm transition-[height] duration-500",
            i === bars.length - 1 ? "bg-accent/70 group-hover:!h-[92%]" : "bg-foreground/[0.09]"
          )}
        />
      ))}
    </div>
  );
}

function VisualEcommerce() {
  return (
    <div className="relative grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-md border border-border bg-surface-sunken p-1.5">
          <span className={cn("block aspect-[4/5] rounded-sm", i === 1 ? "bg-accent/20" : "bg-foreground/[0.06]")} />
          <span className="mt-1.5 block h-1 w-3/4 rounded-full bg-foreground/15" />
          <span className="mt-1 block h-1 w-1/3 rounded-full bg-foreground/25" />
        </div>
      ))}
      <span className="num absolute -right-1.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
        3
      </span>
    </div>
  );
}

function VisualSystem() {
  const rows = [
    ["w-16", "bg-success/50"],
    ["w-20", "bg-warning/50"],
    ["w-12", "bg-success/50"],
    ["w-24", "bg-info/50"],
  ];
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-sunken">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-dim">Registro</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-dim">Status</span>
        <span className="w-10 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-dim">Ação</span>
      </div>
      {rows.map(([w, c], i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/60 px-3 py-2 last:border-0">
          <span className={cn("h-1.5 rounded-full bg-foreground/15", w)} />
          <span className={cn("h-2 w-2 rounded-full", c)} />
          <span className="h-4 w-10 rounded-sm border border-border" />
        </div>
      ))}
    </div>
  );
}

function VisualSaas() {
  return (
    <svg viewBox="0 0 220 90" className="h-24 w-full" fill="none">
      {[20, 45, 70].map((y) => (
        <line key={y} x1="0" x2="220" y1={y} y2={y} stroke="rgb(var(--line))" strokeDasharray="2 4" />
      ))}
      <path d="M0 74 C 30 70, 45 58, 70 56 S 110 44, 135 36 S 180 22, 220 12" stroke="rgb(var(--accent))" strokeWidth="1.6" />
      <path d="M0 74 C 30 70, 45 58, 70 56 S 110 44, 135 36 S 180 22, 220 12 V90 H0Z" fill="rgb(var(--accent) / 0.08)" />
      <path d="M0 82 C 40 80, 70 74, 110 70 S 170 60, 220 52" stroke="rgb(var(--fg-dim))" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="135" cy="36" r="3" fill="rgb(var(--bg))" stroke="rgb(var(--accent))" strokeWidth="1.5" />
    </svg>
  );
}

function VisualApp() {
  return (
    <div className="mx-auto w-[124px] rounded-[22px] border border-border-strong bg-surface-sunken p-2">
      <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-foreground/15" />
      <div className="space-y-2 rounded-[14px] bg-surface p-2.5">
        <span className="block h-1.5 w-10 rounded-full bg-foreground/25" />
        <span className="block font-display text-xl leading-none text-foreground/90">Olá.</span>
        <div className="grid grid-cols-2 gap-1.5">
          <span className="aspect-square rounded-md bg-accent/20" />
          <span className="aspect-square rounded-md bg-foreground/[0.07]" />
          <span className="aspect-square rounded-md bg-foreground/[0.07]" />
          <span className="aspect-square rounded-md bg-foreground/[0.07]" />
        </div>
        <div className="flex justify-between px-1 pt-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-accent" : "bg-foreground/20")} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualAI() {
  const nodes = [
    { x: 18, y: 46, l: "Entrada" },
    { x: 92, y: 18, l: "" },
    { x: 92, y: 74, l: "" },
    { x: 168, y: 46, l: "Modelo" },
    { x: 246, y: 46, l: "Ação" },
  ];
  return (
    <svg viewBox="0 0 270 92" className="h-24 w-full" fill="none">
      <g stroke="rgb(var(--line-strong))" strokeWidth="1">
        <path d="M18 46 C 50 46, 60 18, 92 18" />
        <path d="M18 46 C 50 46, 60 74, 92 74" />
        <path d="M92 18 C 124 18, 136 46, 168 46" />
        <path d="M92 74 C 124 74, 136 46, 168 46" />
      </g>
      <path d="M168 46 H246" stroke="rgb(var(--accent))" strokeWidth="1.4" strokeDasharray="4 4" />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={i === 3 ? 9 : 5} fill="rgb(var(--surface))" stroke={i === 3 || i === 4 ? "rgb(var(--accent))" : "rgb(var(--fg-dim))"} strokeWidth="1.3" />
          {i === 3 && <circle cx={n.x} cy={n.y} r="3" fill="rgb(var(--accent))" />}
          {n.l && (
            <text x={n.x} y={n.y + (i === 3 ? 24 : 20)} textAnchor="middle" fontSize="8" fill="rgb(var(--fg-dim))" fontFamily="var(--font-mono)">
              {n.l}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function VisualInfra() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-sm border border-border bg-surface-sunken px-2 py-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", i === 1 ? "bg-warning/70" : "bg-success/70")} />
            <span className="h-1 flex-1 rounded-full bg-foreground/10" />
          </div>
        ))}
      </div>
      <svg viewBox="0 0 40 60" className="h-16 w-8 shrink-0" fill="none">
        <path d="M0 10 H20 V30 H40 M0 30 H40 M0 50 H20 V30" stroke="rgb(var(--line-strong))" />
        <circle cx="20" cy="30" r="3" fill="rgb(var(--accent))" />
      </svg>
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-border-strong bg-surface-sunken">
        <span className="font-mono text-[9px] text-foreground-dim">API</span>
        <span className="mt-1 h-1 w-6 rounded-full bg-accent/50" />
      </div>
    </div>
  );
}

/* ── Dados ────────────────────────────────────────────────────────────── */

type Service = { title: string; description: string; tags: string[]; visual: ReactNode; className: string };

const services: Service[] = [
  {
    title: "Websites profissionais",
    description: "Sites institucionais com design autoral, conteúdo bem estruturado, SEO técnico e desempenho rápido em qualquer tela.",
    tags: ["Design autoral", "SEO", "CMS"],
    visual: <VisualWebsite />,
    className: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "Landing pages de alta conversão",
    description: "Páginas focadas em um objetivo, com narrativa clara, carregamento leve e formulários integrados ao seu fluxo comercial.",
    tags: ["Campanhas", "Formulários"],
    visual: <VisualLanding />,
    className: "",
  },
  {
    title: "Aplicativos e PWA",
    description: "Aplicações instaláveis, responsivas e com experiência nativa — no navegador ou nas lojas.",
    tags: ["Mobile", "Offline"],
    visual: <VisualApp />,
    className: "lg:row-span-2",
  },
  {
    title: "E-commerce",
    description: "Lojas virtuais com catálogo, checkout, meios de pagamento e gestão de pedidos.",
    tags: ["Checkout", "Catálogo"],
    visual: <VisualEcommerce />,
    className: "",
  },
  {
    title: "Sistemas personalizados",
    description: "Software sob medida para processos internos: cadastros, fluxos de aprovação, relatórios e permissões por perfil.",
    tags: ["Painéis", "Permissões", "Relatórios"],
    visual: <VisualSystem />,
    className: "lg:col-span-2",
  },
  {
    title: "Automações e inteligência artificial",
    description: "Fluxos automatizados e recursos de IA aplicados ao seu negócio — atendimento, classificação, geração de conteúdo e integrações entre ferramentas.",
    tags: ["Workflows", "LLMs", "Agentes"],
    visual: <VisualAI />,
    className: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "SaaS e plataformas",
    description: "Produtos digitais multiusuário, com assinatura, área logada e arquitetura preparada para crescer.",
    tags: ["Multiusuário", "Assinaturas"],
    visual: <VisualSaas />,
    className: "",
  },
  {
    title: "Integrações e infraestrutura",
    description: "APIs, conexões com ERPs, CRMs e gateways, hospedagem, domínios, monitoramento e rotinas de backup.",
    tags: ["APIs", "Cloud", "Deploy"],
    visual: <VisualInfra />,
    className: "",
  },
];

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-20 py-24 sm:py-32" aria-labelledby="servicos-title">
      <div className="container">
        <SectionHeading
          index="01"
          eyebrow="Serviços"
          id="servicos-title"
          title="Do primeiro site ao sistema que"
          accent="sustenta a operação."
          description="Cada projeto nasce de um briefing e é desenhado para o seu contexto. Atuamos em toda a cadeia: estratégia, interface, desenvolvimento, integrações e publicação."
        />

        <ul className="mt-16 grid gap-3 md:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4">
          {services.map((s, i) => (
            <li
              key={s.title}
              className={cn(
                "group relative flex flex-col justify-between gap-8 overflow-hidden rounded-xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong hover:bg-surface-raised/60",
                s.className
              )}
            >
              <div className="relative" aria-hidden="true">{s.visual}</div>
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium tracking-[-0.015em]">{s.title}</h3>
                  <span className="num shrink-0 text-2xs text-foreground-dim">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground-muted">{s.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Destaques">
                  {s.tags.map((t) => (
                    <li key={t} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-foreground-dim">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
