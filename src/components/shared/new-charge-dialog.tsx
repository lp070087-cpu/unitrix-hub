"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { createChargeAction } from "@/app/admin/financeiro/actions";

type ClientOpt = { id: string; name: string; company?: string | null };
type ProjectOpt = { id: string; title: string; clientId: string };

/** Nova cobrança avulsa. Com `fixed`, cliente e projeto vêm do contexto (detalhe do projeto). */
export function NewChargeDialog({
  clients = [], projects = [], fixed, triggerLabel = "Nova cobrança", size = "md",
}: {
  clients?: ClientOpt[]; projects?: ProjectOpt[]; fixed?: { clientId: string; projectId?: string }; triggerLabel?: string; size?: "sm" | "md";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const empty = { clientId: fixed?.clientId ?? "", projectId: fixed?.projectId ?? "", description: "", amount: "", dueDate: "" };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "clientId" ? { projectId: "" } : {}) }));
  const clientProjects = projects.filter((p) => p.clientId === form.clientId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    start(async () => {
      const r = await createChargeAction({ ...form, projectId: form.projectId || undefined, dueDate: form.dueDate || undefined });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Cobrança criada");
      setOpen(false);
      setForm(empty);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={fixed ? "secondary" : "primary"}><Plus />{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent title="Nova cobrança avulsa" description="O cliente é notificado e a cobrança aparece no portal. Não há cobrança automática por gateway.">
        <form onSubmit={submit} className="space-y-4">
          {!fixed && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" required>
                <Select value={form.clientId} onChange={set("clientId")} required>
                  <option value="" disabled>Selecione…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
                </Select>
              </Field>
              <Field label="Projeto" hint="Opcional">
                <Select value={form.projectId} onChange={set("projectId")} disabled={!form.clientId || clientProjects.length === 0}>
                  <option value="">Sem projeto</option>
                  {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
              </Field>
            </div>
          )}
          <Field label="Descrição" required>
            <Input value={form.description} onChange={set("description")} required minLength={2} maxLength={200} placeholder="Ex.: Ajustes adicionais de layout" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor (R$)" required><Input inputMode="decimal" value={form.amount} onChange={set("amount")} required placeholder="0,00" className="num" /></Field>
            <Field label="Vencimento"><Input type="date" value={form.dueDate} onChange={set("dueDate")} /></Field>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
            <Button type="submit" variant="accent" loading={pending}>Criar cobrança</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
