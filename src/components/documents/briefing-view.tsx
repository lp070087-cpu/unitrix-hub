import { ExternalLink } from "lucide-react";
import { BRIEFING_FILE_KINDS, BRIEFING_STEPS, type BriefingFileKind } from "@/lib/briefing/schema";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type BriefingData = Record<string, unknown> & { files?: { id: string; kind: string; label: string; externalUrl: string | null }[] };

function display(v: unknown) {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  if (v === null || v === undefined || v === "") return null;
  return String(v);
}

/** Leitura organizada de um briefing (admin e cliente). */
export function BriefingView({ briefing }: { briefing: BriefingData }) {
  const files = briefing.files ?? [];
  return (
    <div className="space-y-4">
      {BRIEFING_STEPS.map((step, i) => {
        const rows = step.fields.map((f) => ({ ...f, value: display(briefing[f.key]) }));
        const filled = rows.filter((r) => r.value).length;
        return (
          <Card key={step.id}>
            <CardHeader
              title={<span className="flex items-baseline gap-3"><span className="num text-xs text-foreground-dim">{String(i + 1).padStart(2, "0")}</span>{step.title}</span>}
              description={`${filled} de ${rows.length} campos preenchidos`}
            />
            <CardBody>
              <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {rows.map((r) => (
                  <div key={r.key} className={r.type === "textarea" ? "md:col-span-2" : undefined}>
                    <dt className="eyebrow">{r.label}</dt>
                    <dd className={r.value ? "mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground" : "mt-1.5 text-sm text-foreground-dim"}>{r.value ?? "Não informado"}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        );
      })}
      <Card>
        <CardHeader title="Links e materiais" description="Arquivos compartilhados por links externos." />
        <CardBody>
          {files.length === 0 ? (
            <p className="text-sm text-foreground-dim">Nenhum link adicionado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{f.label}</p>
                    <p className="text-xs text-foreground-dim">{BRIEFING_FILE_KINDS[f.kind as BriefingFileKind] ?? f.kind}</p>
                  </div>
                  {f.externalUrl && (
                    <a href={f.externalUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-accent hover:underline">
                      Abrir <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
