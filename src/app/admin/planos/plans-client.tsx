"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Package, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { cn, formatCurrency, PLAN_CATEGORY_MAP, PLAN_INTERVAL_MAP } from "@/lib/utils";
import { createPlanAction, deletePlanAction, togglePlanAction, updatePlanAction } from "./actions";

type Plan = {
  id: string; name: string; description: string | null; price: string; interval: string; category: string;
  features: unknown; active: boolean; _count: { subscriptions: number }; activeSubscriptions: number;
};

const featuresOf = (f: unknown): string[] => (Array.isArray(f) ? f.filter((x): x is string => typeof x === "string") : []);
const SUFFIX: Record<string, string> = { MONTHLY: "/mês", QUARTERLY: "/trimestre", YEARLY: "/ano" };

export function PlansClient({ plans }: { plans: Plan[] }) {
  if (plans.length === 0) {
    return (
      <Card>
        <EmptyState icon={Package} title="Nenhum plano cadastrado" description="Crie planos recorrentes para vincular assinaturas aos clientes." action={<PlanDialog />} />
      </Card>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((p) => <PlanCard key={p.id} plan={p} />)}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const features = featuresOf(plan.features);

  function toggle() {
    start(async () => {
      const r = await togglePlanAction({ planId: plan.id, active: !plan.active });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message);
      router.refresh();
    });
  }
  function remove() {
    const msg = plan._count.subscriptions > 0
      ? `Este plano tem ${plan._count.subscriptions} assinatura(s) e será desativado em vez de excluído. Continuar?`
      : `Excluir o plano "${plan.name}"?`;
    if (!confirm(msg)) return;
    start(async () => {
      const r = await deletePlanAction({ planId: plan.id });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.data?.deleted ? "Plano excluído" : "Plano com assinaturas: desativado");
      router.refresh();
    });
  }

  return (
    <Card className={cn("flex flex-col p-5", !plan.active && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{PLAN_CATEGORY_MAP[plan.category] ?? plan.category}</p>
          <h3 className="mt-1.5 truncate text-[15px] font-semibold text-foreground">{plan.name}</h3>
        </div>
        {plan.active ? <Badge tone="success" dot>Ativo</Badge> : <Badge dot>Inativo</Badge>}
      </div>
      <p className="mt-4 text-foreground">
        <span className="num text-2xl font-semibold tracking-[-0.02em]">{formatCurrency(plan.price)}</span>
        <span className="ml-1 text-xs text-foreground-dim">{SUFFIX[plan.interval] ?? ""}</span>
      </p>
      {plan.description && <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-foreground-muted">{plan.description}</p>}
      {features.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {features.slice(0, 6).map((f, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-foreground-muted"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.8} />{f}</li>
          ))}
          {features.length > 6 && <li className="pl-5 text-xs text-foreground-dim">+{features.length - 6} itens</li>}
        </ul>
      )}
      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="num text-2xs text-foreground-dim">{plan.activeSubscriptions} ativas · {plan._count.subscriptions} total</span>
          <div className="flex items-center gap-0.5">
            <PlanDialog plan={plan} />
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={plan.active ? "Desativar" : "Ativar"} title={plan.active ? "Desativar" : "Ativar"} onClick={toggle} disabled={pending}><Power /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-danger" aria-label="Excluir" title="Excluir" onClick={remove} disabled={pending}><Trash2 /></Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PlanDialog({ plan }: { plan?: Plan }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const initial = () => ({
    name: plan?.name ?? "", description: plan?.description ?? "",
    price: plan ? Number(plan.price).toFixed(2).replace(".", ",") : "",
    interval: plan?.interval ?? "MONTHLY", category: plan?.category ?? "SERVICE", active: plan?.active ?? true,
  });
  const [form, setForm] = useState(initial);
  const [features, setFeatures] = useState<string[]>(featuresOf(plan?.features));
  const [draft, setDraft] = useState("");
  const set = (k: "name" | "description" | "price" | "interval" | "category") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function addFeature() {
    const v = draft.trim();
    if (!v) return;
    setFeatures((f) => [...f, v].slice(0, 40));
    setDraft("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const payload = { ...form, interval: form.interval as "MONTHLY", category: form.category as "SERVICE", features: draft.trim() ? [...features, draft.trim()] : features };
      const r = plan ? await updatePlanAction({ ...payload, planId: plan.id }) : await createPlanAction(payload);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Salvo");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setForm(initial()); setFeatures(featuresOf(plan?.features)); setDraft(""); } }}>
      <DialogTrigger asChild>
        {plan ? <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Editar"><Pencil /></Button> : <Button><Plus />Novo plano</Button>}
      </DialogTrigger>
      <DialogContent title={plan ? "Editar plano" : "Novo plano"} className="sm:max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome" required><Input value={form.name} onChange={set("name")} required minLength={2} maxLength={120} /></Field>
          <Field label="Descrição"><Textarea value={form.description} onChange={set("description")} maxLength={2000} className="min-h-[72px]" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Preço (R$)" required><Input inputMode="decimal" value={form.price} onChange={set("price")} required className="num" placeholder="0,00" /></Field>
            <Field label="Intervalo">
              <Select value={form.interval} onChange={set("interval")}>{Object.entries(PLAN_INTERVAL_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
            </Field>
            <Field label="Categoria">
              <Select value={form.category} onChange={set("category")}>{Object.entries(PLAN_CATEGORY_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-foreground-muted">O que está incluído</p>
            {features.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md border border-border bg-surface-sunken px-3 py-1.5 text-[13px]">
                    <Input value={f} onChange={(e) => setFeatures(features.map((x, j) => (j === i ? e.target.value : x)))} className="h-7 border-0 bg-transparent px-0 focus:ring-0" maxLength={200} aria-label={`Item ${i + 1}`} />
                    <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))} className="text-foreground-dim hover:text-danger" aria-label="Remover item"><X className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} placeholder="Ex.: Backup diário" maxLength={200} />
              <Button type="button" variant="secondary" onClick={addFeature}><Plus />Item</Button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-foreground-muted">
            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Plano ativo (disponível para novas assinaturas)
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
            <Button type="submit" variant="accent" loading={pending}>{plan ? "Salvar" : "Criar plano"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
