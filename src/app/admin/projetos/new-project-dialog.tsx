"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { formatCurrency } from "@/lib/utils";
import { createProjectAction } from "./actions";

type ClientOpt = { id: string; name: string; company: string | null };

function parseMoney(v: string): number {
  const s = v.trim().replace(/\s|R\$/g, "");
  if (!s) return 0;
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : 0;
}

export function NewProjectDialog({ clients, defaultClientId }: { clients: ClientOpt[]; defaultClientId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ clientId: defaultClientId ?? "", title: "", description: "", startDate: "", endDate: "", totalValue: "", generateCharges: true });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const total = parseMoney(form.totalValue);
  const cents = Math.round(total * 100);
  const deposit = Math.round(cents / 2) / 100;
  const balance = (cents - Math.round(cents / 2)) / 100;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    start(async () => {
      const r = await createProjectAction({ ...form, totalValue: form.totalValue || undefined, startDate: form.startDate || undefined, endDate: form.endDate || undefined });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Projeto criado");
      setOpen(false);
      setForm({ clientId: defaultClientId ?? "", title: "", description: "", startDate: "", endDate: "", totalValue: "", generateCharges: true });
      if (r.data?.id) router.push(`/admin/projetos/${r.data.id}`);
      else router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary"><Plus />Novo projeto</Button>
      </DialogTrigger>
      <DialogContent title="Novo projeto" description="O projeto aparece no portal do cliente assim que for criado." className="sm:max-w-xl">
        {clients.length === 0 ? (
          <p className="text-sm text-foreground-muted">Cadastre um cliente antes de criar um projeto.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Cliente" required>
              <Select value={form.clientId} onChange={set("clientId")} required>
                <option value="" disabled>Selecione…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
              </Select>
            </Field>
            <Field label="Título" required>
              <Input value={form.title} onChange={set("title")} required minLength={2} maxLength={160} placeholder="Ex.: Plataforma de agendamentos" />
            </Field>
            <Field label="Descrição">
              <Textarea value={form.description} onChange={set("description")} maxLength={5000} className="min-h-[80px]" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Início"><Input type="date" value={form.startDate} onChange={set("startDate")} /></Field>
              <Field label="Entrega prevista"><Input type="date" value={form.endDate} min={form.startDate || undefined} onChange={set("endDate")} /></Field>
            </div>
            <Field label="Valor total (R$)" hint="Deixe vazio se ainda não houver valor fechado.">
              <Input inputMode="decimal" value={form.totalValue} onChange={set("totalValue")} placeholder="0,00" className="num" />
            </Field>
            <label className="flex items-start gap-3 rounded-md border border-border bg-surface-sunken p-3 text-sm">
              <input
                type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                checked={form.generateCharges} onChange={(e) => setForm((f) => ({ ...f, generateCharges: e.target.checked }))}
              />
              <span>
                <span className="font-medium text-foreground">Gerar cobranças 50/50</span>
                <span className="mt-0.5 block text-[13px] text-foreground-muted">
                  {total > 0 ? <>Entrada <span className="num">{formatCurrency(deposit)}</span> no início e saldo <span className="num">{formatCurrency(balance)}</span> na entrega.</> : "Entrada no início e saldo na entrega, a partir do valor total."}
                </span>
              </span>
            </label>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
              <Button type="submit" variant="accent" loading={pending}>Criar projeto</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
