import { Bell, Check, FileSignature, Presentation, Wallet, LayoutGrid, FolderKanban, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const timeline = [
  { t: "Briefing aprovado", s: "done" },
  { t: "Proposta e contrato", s: "done" },
  { t: "Design de interface", s: "done" },
  { t: "Desenvolvimento", s: "current" },
  { t: "Validação", s: "todo" },
  { t: "Entrega", s: "todo" },
] as const;

const features = [
  "Progresso do projeto e etapas em tempo real",
  "Contratos digitais com assinatura eletrônica",
  "Apresentações e entregas em um só lugar",
  "Pagamentos 50/50 com histórico organizado",
  "Notificações a cada avanço importante",
];

function Window() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong/70 bg-surface shadow-lift" aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <span className="truncate rounded-sm bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-foreground-dim">hub · área do cliente</span>
        <Bell className="h-3.5 w-3.5 text-foreground-dim" strokeWidth={1.6} />
      </div>

      <div className="grid md:grid-cols-[168px_1fr]">
        <aside className="hidden border-r border-border p-3 md:block">
          <div className="mb-4 flex items-center gap-2 px-2 pt-1">
            <LogoMark className="h-5 w-5" />
            <span className="text-[12px] font-semibold">Unitrix Hub</span>
          </div>
          {[
            [LayoutGrid, "Visão geral", true],
            [FolderKanban, "Projetos", false],
            [FileSignature, "Contratos", false],
            [Presentation, "Apresentações", false],
            [Wallet, "Pagamentos", false],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof LayoutGrid;
            return (
              <div
                key={label as string}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px]",
                  active ? "bg-surface-raised text-foreground" : "text-foreground-dim"
                )}
              >
                <I className={cn("h-3.5 w-3.5", active && "text-accent")} strokeWidth={1.6} />
                {label as string}
              </div>
            );
          })}
        </aside>

        <div className="min-w-0 space-y-3 p-3 sm:p-5">
          {/* Projeto */}
          <div className="rounded-lg border border-border bg-surface-sunken p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground-dim">Projeto em andamento</p>
                <p className="mt-1.5 text-[15px] font-medium">Plataforma de exemplo</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Desenvolvimento
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                <div className="h-full w-[64%] rounded-full bg-accent" />
              </div>
              <span className="num text-[11px] text-foreground-muted">64%</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Timeline */}
            <div className="rounded-lg border border-border p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground-dim">Etapas</p>
              <ol className="mt-3 space-y-2.5">
                {timeline.map((s) => (
                  <li key={s.t} className="flex items-center gap-2.5 text-[12px]">
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        s.s === "done" && "border-success/40 bg-success/15 text-success",
                        s.s === "current" && "border-accent",
                        s.s === "todo" && "border-border-strong"
                      )}
                    >
                      {s.s === "done" && <Check className="h-2.5 w-2.5" strokeWidth={2.4} />}
                      {s.s === "current" && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </span>
                    <span className={s.s === "todo" ? "text-foreground-dim" : "text-foreground-muted"}>{s.t}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-3">
              {/* Pagamentos */}
              <div className="rounded-lg border border-border p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground-dim">Pagamentos · 50/50</p>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <span className="h-1.5 rounded-full bg-success/70" />
                  <span className="h-1.5 rounded-full bg-foreground/[0.08]" />
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
                  <span>
                    <span className="block text-foreground-muted">Entrada</span>
                    <span className="text-success">Pago</span>
                  </span>
                  <span>
                    <span className="block text-foreground-muted">Saldo</span>
                    <span className="text-foreground-dim">Na entrega</span>
                  </span>
                </div>
              </div>
              {/* Documentos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <FileSignature className="h-3.5 w-3.5 text-foreground-dim" strokeWidth={1.6} />
                  <p className="mt-2 text-[11px] text-foreground-muted">Contrato</p>
                  <p className="text-[11px] text-success">Assinado</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <Presentation className="h-3.5 w-3.5 text-foreground-dim" strokeWidth={1.6} />
                  <p className="mt-2 text-[11px] text-foreground-muted">Apresentação</p>
                  <p className="text-[11px] text-info">Nova versão</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="rounded-lg border border-border p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground-dim">Notificações</p>
            <ul className="mt-3 divide-y divide-border/70">
              {[
                ["Nova entrega disponível para validação", "agora"],
                ["Apresentação do layout atualizada", "2 d"],
                ["Pagamento de entrada confirmado", "1 sem"],
              ].map(([t, when], i) => (
                <li key={t} className="flex items-center justify-between gap-3 py-2 text-[12px] first:pt-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", i === 0 ? "bg-accent" : "bg-foreground/20")} />
                    <span className="truncate text-foreground-muted">{t}</span>
                  </span>
                  <span className="num shrink-0 text-[10px] text-foreground-dim">{when}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HubDemo() {
  return (
    <section id="hub" className="relative scroll-mt-20 overflow-hidden border-y border-border bg-surface-sunken/60 py-24 sm:py-32" aria-labelledby="hub-title">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_80%_50%,black,transparent_70%)]" />
      <div className="container relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            index="05"
            eyebrow="Unitrix Hub"
            id="hub-title"
            title="Seu projeto,"
            accent="visível do início ao fim."
            align="stack"
          />
          <p className="mt-6 max-w-lg text-pretty leading-relaxed text-foreground-muted">
            Todo cliente Unitrix recebe acesso ao Hub — o portal onde você acompanha o andamento, aprova etapas, assina
            documentos e consulta pagamentos, sem depender de e-mails perdidos.
          </p>
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/login"
            className="group mt-10 inline-flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline"
          >
            Já é cliente? Acessar o Hub
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
          </Link>
        </div>

        <figure className="min-w-0">
          <Window />
          <figcaption className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-dim">
            <span className="h-px w-5 bg-border-strong" />
            Demonstração ilustrativa — dados fictícios
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
