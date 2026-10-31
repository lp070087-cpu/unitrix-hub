"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeOff, MessageSquareText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatDateTime } from "@/lib/utils";
import { addProjectUpdateAction, deleteProjectUpdateAction } from "../actions";

type Update = { id: string; title: string; message: string; visible: boolean; createdAt: string };

export function UpdatesPanel({ projectId, updates }: { projectId: string; updates: Update[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ title: "", message: "", visible: true });
  const [composing, setComposing] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addProjectUpdateAction({ projectId, ...form });
      if (!r.ok) return void toast.error(r.error);
      toast.success(form.visible ? "Atualização publicada e cliente notificado" : "Registro interno salvo");
      setForm({ title: "", message: "", visible: true });
      setComposing(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Remover esta atualização?")) return;
    start(async () => {
      const r = await deleteProjectUpdateAction({ updateId: id });
      if (!r.ok) return void toast.error(r.error);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader
        title="Atualizações"
        description="Comunicados do andamento. Os visíveis notificam o cliente."
        action={!composing && <Button size="sm" variant="secondary" onClick={() => setComposing(true)}>Escrever</Button>}
      />
      <CardBody className="space-y-4">
        {composing && (
          <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-surface-sunken p-4">
            <Field label="Título" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={2} maxLength={160} /></Field>
            <Field label="Mensagem" required><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={2} maxLength={5000} /></Field>
            <label className="flex items-center gap-2 text-[13px] text-foreground-muted">
              <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
              Visível ao cliente (envia notificação)
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setComposing(false)}>Cancelar</Button>
              <Button type="submit" variant="accent" loading={pending}>Publicar</Button>
            </div>
          </form>
        )}
        {updates.length === 0 && !composing ? (
          <EmptyState icon={MessageSquareText} title="Nenhuma atualização" description="Mantenha o cliente informado sobre avanços, entregas parciais e próximos passos." className="py-8" />
        ) : (
          <ol className="relative space-y-5 border-l border-border pl-5">
            {updates.map((u) => (
              <li key={u.id} className="relative">
                <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full border border-border-strong bg-surface" aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{u.title}</p>
                      {!u.visible && <Badge><EyeOff className="h-3 w-3" />Interno</Badge>}
                    </div>
                    <p className="num mt-0.5 text-2xs text-foreground-dim">{formatDateTime(u.createdAt)}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:text-danger" aria-label="Remover atualização" disabled={pending} onClick={() => remove(u.id)}><Trash2 /></Button>
                </div>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-foreground-muted">{u.message}</p>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
