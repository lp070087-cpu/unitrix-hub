"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Plus, Save, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Progress } from "@/components/ui/states";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BRIEFING_FILE_KINDS, BRIEFING_STEPS, ALL_FIELD_DEFS, type BriefingFileKind, type FieldDef } from "@/lib/briefing/schema";
import { PROJECT_TYPES, cn } from "@/lib/utils";
import { saveBriefingDraft, submitBriefing } from "../actions";

type FileRow = { kind: BriefingFileKind; label: string; externalUrl: string };
type Values = Record<string, string>;

function initialValues(b: Record<string, unknown>): Values {
  const v: Values = {};
  for (const f of ALL_FIELD_DEFS) {
    const raw = b[f.key];
    v[f.key] = f.type === "bool" ? (raw === true ? "yes" : raw === false ? "no" : "") : typeof raw === "string" ? raw : "";
  }
  return v;
}

export function BriefingWizard({ briefing }: { briefing: Record<string, unknown> & { id: string; title: string; files: { kind: string; label: string; externalUrl: string | null }[] } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(briefing.title);
  const [values, setValues] = useState<Values>(() => initialValues(briefing));
  const [files, setFiles] = useState<FileRow[]>(() =>
    briefing.files.map((f) => ({ kind: (f.kind in BRIEFING_FILE_KINDS ? f.kind : "OTHER") as BriefingFileKind, label: f.label, externalUrl: f.externalUrl ?? "" }))
  );
  const [dirty, setDirty] = useState(false);

  const total = BRIEFING_STEPS.length;
  const current = BRIEFING_STEPS[step];
  const filledCount = ALL_FIELD_DEFS.filter((f) => values[f.key]?.trim()).length;
  const percent = Math.round((filledCount / ALL_FIELD_DEFS.length) * 100);

  const set = (k: string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };

  function payload() {
    return {
      title,
      fields: Object.fromEntries(ALL_FIELD_DEFS.map((f) => [f.key, values[f.key] ?? ""])),
      files: files.filter((f) => f.label.trim() || f.externalUrl.trim()),
    };
  }

  function save(kind: "save" | "submit", onDone?: () => void) {
    setBusy(kind);
    start(async () => {
      const res = kind === "save" ? await saveBriefingDraft(briefing.id, payload()) : await submitBriefing(briefing.id, payload());
      setBusy(null);
      if (!res.ok) return void toast.error(res.error);
      setDirty(false);
      toast.success(res.message ?? "Salvo");
      onDone?.();
      router.refresh();
    });
  }

  function go(next: number) {
    setStep(Math.max(0, Math.min(total - 1, next)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3 text-xs text-foreground-muted">
            <span>Etapa <span className="num text-foreground">{step + 1}</span> de {total}</span>
            <span className="num">{percent}% preenchido</span>
          </div>
          <Progress value={((step + 1) / total) * 100} />
          <ol className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {BRIEFING_STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                    i === step ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground"
                  )}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span className={cn("grid h-5 w-5 place-items-center rounded-full border text-[10px] font-mono", i < step ? "border-accent bg-accent text-accent-fg" : i === step ? "border-accent text-accent" : "border-border")}>
                    {i < step ? <Check className="h-3 w-3" strokeWidth={2} /> : i + 1}
                  </span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{current.title}</h2>
            <p className="mt-1 text-sm text-foreground-muted">{current.description}</p>
          </div>

          {step === 0 && (
            <Field label="Nome do briefing" required htmlFor="bw-title">
              <Input id="bw-title" maxLength={160} value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} />
            </Field>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {current.fields
              .filter((f) => !(f.key === "aiNeeds" && values.needsAi === "no"))
              .map((f) => <FieldInput key={f.key} def={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} />)}
          </div>

          {current.id === "infra" && <FilesEditor files={files} onChange={(f) => { setFiles(f); setDirty(true); }} />}
        </CardBody>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}><ArrowLeft strokeWidth={1.6} /> Voltar</Button>
          <Button type="button" variant="outline" onClick={() => save("save")} loading={pending && busy === "save"} disabled={pending}>
            <Save strokeWidth={1.6} /> Salvar rascunho
          </Button>
        </div>
        {step < total - 1 ? (
          <Button type="button" variant="primary" onClick={() => go(step + 1)}>Próxima etapa <ArrowRight strokeWidth={1.6} /></Button>
        ) : (
          <SubmitDialog pending={pending && busy === "submit"} onConfirm={(close) => save("submit", close)} />
        )}
      </div>
      {dirty && <p className="text-right text-xs text-foreground-dim">Alterações não salvas.</p>}
    </div>
  );
}

function SubmitDialog({ pending, onConfirm }: { pending: boolean; onConfirm: (close: () => void) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="accent"><Send strokeWidth={1.6} /> Enviar para análise</Button>
      </DialogTrigger>
      <DialogContent title="Enviar briefing para análise?" description="Após o envio, o briefing fica bloqueado para edição até a avaliação da equipe Unitrix.">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild><Button variant="ghost">Revisar mais</Button></DialogClose>
          <Button variant="accent" loading={pending} onClick={() => onConfirm(() => setOpen(false))}>Confirmar envio</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({ def, value, onChange }: { def: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = `bf-${def.key}`;
  const wide = def.type === "textarea";
  return (
    <Field label={def.label} hint={def.hint} htmlFor={id} className={wide ? "sm:col-span-2" : undefined}>
      {def.type === "textarea" ? (
        <Textarea id={id} rows={def.rows ?? 4} maxLength={8000} value={value} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : def.type === "bool" ? (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Não sei / prefiro não informar</option>
          <option value="yes">Sim</option>
          <option value="no">Não</option>
        </Select>
      ) : def.type === "kind" ? (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione…</option>
          {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          {value && !PROJECT_TYPES.includes(value) && <option value={value}>{value}</option>}
        </Select>
      ) : (
        <Input id={id} maxLength={500} value={value} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function FilesEditor({ files, onChange }: { files: FileRow[]; onChange: (f: FileRow[]) => void }) {
  return (
    <div className="border-t border-border pt-6">
      <p className="text-sm font-medium text-foreground">Links de arquivos</p>
      <p className="mt-1 text-xs text-foreground-muted">Compartilhe logo, referências e documentos via links https (Google Drive, Dropbox, Figma…). Verifique se o link está com acesso liberado.</p>
      <ul className="mt-4 space-y-3">
        {files.map((f, i) => (
          <li key={i} className="grid gap-2 rounded-md border border-border bg-surface-sunken p-3 sm:grid-cols-[140px_1fr_1.4fr_auto] sm:items-center">
            <Select aria-label="Tipo" value={f.kind} onChange={(e) => onChange(files.map((x, j) => (j === i ? { ...x, kind: e.target.value as BriefingFileKind } : x)))}>
              {Object.entries(BRIEFING_FILE_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Input aria-label="Descrição" placeholder="Descrição" maxLength={160} value={f.label} onChange={(e) => onChange(files.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <Input
              aria-label="URL" placeholder="https://" type="url" inputMode="url" value={f.externalUrl}
              aria-invalid={!!f.externalUrl && !f.externalUrl.startsWith("https://")}
              onChange={(e) => onChange(files.map((x, j) => (j === i ? { ...x, externalUrl: e.target.value.trim() } : x)))}
            />
            <Button type="button" variant="ghost" size="icon" aria-label="Remover link" onClick={() => onChange(files.filter((_, j) => j !== i))}><X strokeWidth={1.6} /></Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" size="sm" className="mt-3" disabled={files.length >= 20} onClick={() => onChange([...files, { kind: "REFERENCE", label: "", externalUrl: "" }])}>
        <Plus strokeWidth={1.6} /> Adicionar link
      </Button>
    </div>
  );
}
