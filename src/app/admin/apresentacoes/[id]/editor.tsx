"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, Plus, Save, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { CopyLinkButton } from "@/components/documents/copy-link-button";
import {
  SECTION_TYPES, SECTION_TYPE_LABEL, emptySection,
  type PresentationContent, type PresentationSection, type SectionType,
} from "@/lib/presentations/types";
import { savePresentation, sendPresentation, setPresentationStatus } from "../actions";

type Meta = { id: string; slug: string; title: string; status: string; projectId: string | null };

const HAS_BODY: SectionType[] = ["text", "cta", "investment"];
const HAS_ITEMS: SectionType[] = ["features", "timeline", "investment"];

export function PresentationEditor({ presentation, projects, initialContent }: { presentation: Meta; projects: { id: string; title: string }[]; initialContent: PresentationContent }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [title, setTitle] = useState(presentation.title);
  const [projectId, setProjectId] = useState(presentation.projectId ?? "");
  const [content, setContent] = useState<PresentationContent>(initialContent);
  const [dirty, setDirty] = useState(false);
  const [newType, setNewType] = useState<SectionType>("text");
  const locked = presentation.status === "ACCEPTED";

  function update(fn: (c: PresentationContent) => PresentationContent) {
    setContent((c) => fn(c));
    setDirty(true);
  }
  const setHero = (k: keyof PresentationContent["hero"], v: string) => update((c) => ({ ...c, hero: { ...c.hero, [k]: v } }));
  const setSection = (idx: number, patch: Partial<PresentationSection>) =>
    update((c) => ({ ...c, sections: c.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));
  const move = (idx: number, dir: -1 | 1) =>
    update((c) => {
      const next = [...c.sections];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return c;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...c, sections: next };
    });
  const remove = (idx: number) => update((c) => ({ ...c, sections: c.sections.filter((_, i) => i !== idx) }));

  function run<T>(key: string, fn: () => Promise<{ ok: true; data?: T; message?: string } | { ok: false; error: string }>, after?: () => void) {
    setBusy(key);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Feito");
      after?.();
      router.refresh();
    });
  }

  const save = () => run("save", () => savePresentation(presentation.id, { title, projectId, content }), () => setDirty(false));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        {locked && (
          <p className="rounded-md border border-success/25 bg-success/[0.06] px-4 py-3 text-sm text-foreground-muted">
            Esta proposta foi aprovada pelo cliente e o conteúdo está bloqueado para edição.
          </p>
        )}
        <fieldset disabled={locked} className="space-y-6">
          <Card>
            <CardHeader title="Geral" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Título interno" required className="sm:col-span-2" htmlFor="pe-title">
                <Input id="pe-title" value={title} maxLength={160} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} />
              </Field>
              <Field label="Projeto associado" htmlFor="pe-project">
                <Select id="pe-project" value={projectId} onChange={(e) => { setProjectId(e.target.value); setDirty(true); }}>
                  <option value="">Sem projeto</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
              </Field>
              <Field label="Tema" htmlFor="pe-theme">
                <Select id="pe-theme" value={content.theme ?? "dark"} onChange={(e) => update((c) => ({ ...c, theme: e.target.value as "dark" | "paper" }))}>
                  <option value="dark">Escuro (estúdio)</option>
                  <option value="paper">Papel (editorial claro)</option>
                </Select>
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Abertura (hero)" description="Primeira tela da apresentação." />
            <CardBody className="grid gap-4">
              <Field label="Sobretítulo" htmlFor="pe-eyebrow"><Input id="pe-eyebrow" maxLength={120} value={content.hero.eyebrow} onChange={(e) => setHero("eyebrow", e.target.value)} /></Field>
              <Field label="Título" htmlFor="pe-htitle"><Input id="pe-htitle" maxLength={200} value={content.hero.title} onChange={(e) => setHero("title", e.target.value)} /></Field>
              <Field label="Subtítulo" htmlFor="pe-sub"><Textarea id="pe-sub" rows={3} maxLength={1200} value={content.hero.subtitle} onChange={(e) => setHero("subtitle", e.target.value)} /></Field>
            </CardBody>
          </Card>

          {content.sections.length === 0 && (
            <Card><CardBody className="pt-5 text-sm text-foreground-muted">Nenhuma seção. Adicione abaixo.</CardBody></Card>
          )}

          {content.sections.map((s, idx) => (
            <Card key={s.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="num text-xs text-foreground-dim">{String(idx + 1).padStart(2, "0")}</span>
                  <Badge tone="accent">{SECTION_TYPE_LABEL[s.type]}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Mover para cima" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp strokeWidth={1.6} /></Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Mover para baixo" onClick={() => move(idx, 1)} disabled={idx === content.sections.length - 1}><ArrowDown strokeWidth={1.6} /></Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Remover seção" onClick={() => remove(idx)}><Trash2 strokeWidth={1.6} /></Button>
                </div>
              </div>
              <CardBody className="grid gap-4 pt-4">
                <Field label="Título da seção" htmlFor={`t-${s.id}`}><Input id={`t-${s.id}`} maxLength={200} value={s.title} onChange={(e) => setSection(idx, { title: e.target.value })} /></Field>
                {s.type === "investment" && (
                  <Field label="Valor do investimento (R$)" hint="Deixe vazio para não exibir valor." htmlFor={`a-${s.id}`}>
                    <Input
                      id={`a-${s.id}`} type="number" min="0" step="0.01" inputMode="decimal" className="num"
                      value={s.amount ?? ""}
                      onChange={(e) => setSection(idx, { amount: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })}
                    />
                  </Field>
                )}
                {HAS_BODY.includes(s.type) && (
                  <Field label={s.type === "investment" ? "Descrição" : "Texto"} htmlFor={`b-${s.id}`}>
                    <Textarea id={`b-${s.id}`} rows={s.type === "text" ? 6 : 3} maxLength={8000} value={s.body ?? ""} onChange={(e) => setSection(idx, { body: e.target.value })} />
                  </Field>
                )}
                {HAS_ITEMS.includes(s.type) && (
                  <ItemsEditor
                    label={s.type === "timeline" ? "Etapas" : s.type === "investment" ? "Itens inclusos" : "Itens"}
                    items={s.items ?? []}
                    onChange={(items) => setSection(idx, { items })}
                  />
                )}
                {s.type === "investment" && (
                  <Field label="Condições / observações" htmlFor={`n-${s.id}`}>
                    <Textarea id={`n-${s.id}`} rows={2} maxLength={4000} value={s.notes ?? ""} onChange={(e) => setSection(idx, { notes: e.target.value })} />
                  </Field>
                )}
              </CardBody>
            </Card>
          ))}

          <Card>
            <CardBody className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-end">
              <Field label="Adicionar seção" className="flex-1" htmlFor="pe-newtype">
                <Select id="pe-newtype" value={newType} onChange={(e) => setNewType(e.target.value as SectionType)}>
                  {SECTION_TYPES.map((t) => <option key={t} value={t}>{SECTION_TYPE_LABEL[t]}</option>)}
                </Select>
              </Field>
              <Button type="button" variant="secondary" onClick={() => update((c) => ({ ...c, sections: [...c.sections, emptySection(newType)] }))} disabled={content.sections.length >= 30}>
                <Plus strokeWidth={1.6} /> Adicionar
              </Button>
            </CardBody>
          </Card>
        </fieldset>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <Card>
          <CardHeader title="Publicação" description={dirty ? "Há alterações não salvas." : "Tudo salvo."} />
          <CardBody className="space-y-3">
            <Button className="w-full" variant="primary" onClick={save} loading={pending && busy === "save"} disabled={locked || !dirty}>
              <Save strokeWidth={1.6} /> Salvar
            </Button>
            {!locked && (
              <Button
                className="w-full" variant="accent" loading={pending && busy === "send"} disabled={dirty}
                title={dirty ? "Salve antes de enviar" : undefined}
                onClick={() => run("send", () => sendPresentation(presentation.id))}
              >
                <Send strokeWidth={1.6} /> {presentation.status === "SENT" || presentation.status === "VIEWED" ? "Reenviar aviso" : "Enviar ao cliente"}
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              <CopyLinkButton path={`/apresentacao/${presentation.slug}`} />
              <Button asChild variant="ghost" size="sm"><a href={`/apresentacao/${presentation.slug}`} target="_blank" rel="noreferrer"><Eye strokeWidth={1.6} /> Pré-visualizar</a></Button>
            </div>
            {presentation.status !== "DRAFT" && presentation.status !== "ACCEPTED" && (
              <p className="text-xs text-foreground-dim">O link é visível para quem o possuir enquanto o status for Enviada/Visualizada.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Status" />
          <CardBody className="flex flex-wrap gap-2">
            {presentation.status !== "DRAFT" && presentation.status !== "ACCEPTED" && (
              <Button size="sm" variant="outline" loading={pending && busy === "draft"} onClick={() => run("draft", () => setPresentationStatus(presentation.id, "DRAFT"))}>Voltar a rascunho</Button>
            )}
            {presentation.status !== "ARCHIVED" && (
              <Button size="sm" variant="ghost" loading={pending && busy === "archive"} onClick={() => run("archive", () => setPresentationStatus(presentation.id, "ARCHIVED"))}>Arquivar</Button>
            )}
            {presentation.status === "ARCHIVED" && <p className="text-xs text-foreground-muted">Arquivada: o link público está desativado.</p>}
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function ItemsEditor({ label, items, onChange }: { label: string; items: { title: string; description: string }[]; onChange: (items: { title: string; description: string }[]) => void }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-foreground-muted">{label}</p>
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="rounded-md border border-border bg-surface-sunken p-3">
            <div className="flex items-start gap-2">
              <span className="num mt-2.5 w-5 shrink-0 text-xs text-foreground-dim">{i + 1}</span>
              <div className="grid min-w-0 flex-1 gap-2">
                <Input aria-label={`Título do item ${i + 1}`} placeholder="Título" maxLength={200} value={it.title} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <Textarea aria-label={`Descrição do item ${i + 1}`} placeholder="Descrição" rows={2} className="min-h-[64px]" maxLength={2000} value={it.description} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
              </div>
              <div className="flex shrink-0 flex-col">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Subir item" disabled={i === 0} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}><ArrowUp strokeWidth={1.6} /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Descer item" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }}><ArrowDown strokeWidth={1.6} /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Remover item" onClick={() => onChange(items.filter((_, j) => j !== i))}><X strokeWidth={1.6} /></Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <Button type="button" variant="ghost" size="sm" className="mt-2" disabled={items.length >= 30} onClick={() => onChange([...items, { title: "", description: "" }])}>
        <Plus strokeWidth={1.6} /> Adicionar item
      </Button>
    </div>
  );
}
