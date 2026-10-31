"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { formatCurrency, PLAN_INTERVAL_MAP } from "@/lib/utils";
import { createSubscriptionAction } from "./actions";

type ClientOpt = { id: string; name: string; company: string | null };
type PlanOpt = { id: string; name: string; price: string; interval: string };

function todayInput() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function NewSubscriptionDialog({ clients, plans }: { clients: ClientOpt[]; plans: PlanOpt[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const initial = () => {
    const t = todayInput();
    return { clientId: "", planId: "", price: "", billingDay: String(Math.min(28, Number(t.slice(8, 10)))), startDate: t, notes: "" };
  };
  const [form, setForm] = useState(initial);
  const set = (k: keyof ReturnType<typeof initial>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const plan = plans.find((p) => p.id === form.planId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    start(async () => {
      const r = await createSubscriptionAction({ ...form, billingDay: Number(form.billingDay), price: form.price || undefined, notes: form.notes || undefined });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Assinatura criada");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(initial()); }}>
      <DialogTrigger asChild><Button><Plus />Nova assinatura</Button></DialogTrigger>
      <DialogContent title="Nova assinatura" description="A primeira cobrança vence no próximo dia de cobrança a partir do início.">
        {plans.length === 0 ? (
          <p className="text-sm text-foreground-muted">Nenhum plano ativo. <Link href="/admin/planos" className="text-accent hover:underline">Crie um plano</Link> primeiro.</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-foreground-muted">Cadastre um cliente antes de criar uma assinatura.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Cliente" required>
              <Select value={form.clientId} onChange={set("clientId")} required>
                <option value="" disabled>Selecione…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
              </Select>
            </Field>
            <Field label="Plano" required>
              <Select value={form.planId} onChange={set("planId")} required>
                <option value="" disabled>Selecione…</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatCurrency(p.price)} {PLAN_INTERVAL_MAP[p.interval]?.toLowerCase()}</option>)}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Preço personalizado" hint={plan ? `Padrão ${formatCurrency(plan.price)}` : "Opcional"}>
                <Input inputMode="decimal" value={form.price} onChange={set("price")} className="num" placeholder="0,00" />
              </Field>
              <Field label="Dia de cobrança" required hint="1 a 28">
                <Input type="number" min={1} max={28} value={form.billingDay} onChange={set("billingDay")} required className="num" />
              </Field>
              <Field label="Início" required>
                <Input type="date" value={form.startDate} onChange={set("startDate")} required />
              </Field>
            </div>
            <Field label="Observações internas"><Textarea value={form.notes} onChange={set("notes")} maxLength={2000} className="min-h-[64px]" /></Field>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
              <Button type="submit" variant="accent" loading={pending}>Criar assinatura</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
