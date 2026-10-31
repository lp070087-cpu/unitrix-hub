"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilePlus2, History, Pause, Play, Repeat, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentActions } from "@/components/shared/payment-actions";
import { formatDay } from "@/lib/billing/format";
import { cn, formatCurrency, PAYMENT_STATUS_MAP, PLAN_CATEGORY_MAP, PLAN_INTERVAL_MAP, SUBSCRIPTION_STATUS_MAP } from "@/lib/utils";
import { cancelSubscriptionAction, generateChargeAction, pauseSubscriptionAction, resumeSubscriptionAction } from "./actions";

type Payment = { id: string; description: string; amount: string; status: string; dueDate: string | null; paidAt: string | null; chargeKey: string | null; method: string | null };
type Sub = {
  id: string; status: string; startedAt: string; nextBilling: string | null; pausedAt: string | null; canceledAt: string | null; cancelReason: string | null;
  price: string | null; billingDay: number | null; notes: string | null; effectivePrice: number; monthly: number;
  client: { id: string; name: string; company: string | null };
  plan: { id: string; name: string; price: string; interval: string; category: string };
  payments: Payment[];
};

export function SubscriptionsList({ subscriptions, highlight, hasFilters, hasPlans }: { subscriptions: Sub[]; highlight?: string; hasFilters: boolean; hasPlans: boolean }) {
  if (subscriptions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Repeat}
          title={hasFilters ? "Nenhuma assinatura encontrada" : "Nenhuma assinatura"}
          description={hasFilters ? "Ajuste os filtros." : hasPlans ? "Vincule um plano a um cliente para iniciar a receita recorrente." : "Crie um plano primeiro e depois vincule-o a um cliente."}
        />
      </Card>
    );
  }
  return (
    <Card className="divide-y divide-border">
      {subscriptions.map((s) => <SubRow key={s.id} s={s} highlight={s.id === highlight} />)}
    </Card>
  );
}

function SubRow({ s, highlight }: { s: Sub; highlight?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const openCharges = s.payments.filter((p) => p.status === "PENDING" || p.status === "OVERDUE").length;
  const canBill = s.status === "ACTIVE" || s.status === "PAST_DUE";

  function run(fn: () => Promise<{ ok: boolean; error?: string; message?: string; data?: any }>, success?: (d: any) => string) {
    start(async () => {
      const r = await fn();
      if (!r.ok) return void toast.error(r.error);
      toast.success(success ? success(r.data) : r.message ?? "Feito");
      router.refresh();
    });
  }

  return (
    <div className={cn("grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-center", highlight && "bg-accent/[0.04]")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{s.client.name}</p>
          <StatusBadge map={SUBSCRIPTION_STATUS_MAP} status={s.status} />
        </div>
        <p className="mt-0.5 truncate text-[13px] text-foreground-muted">
          {s.plan.name} <span className="text-foreground-dim">· {PLAN_CATEGORY_MAP[s.plan.category] ?? s.plan.category}</span>
        </p>
        {s.status === "CANCELED" && s.cancelReason && <p className="mt-1 truncate text-xs text-foreground-dim">Motivo: {s.cancelReason}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-3 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Valor</p>
          <p className="num mt-1 text-foreground">{formatCurrency(s.effectivePrice)}<span className="text-2xs text-foreground-dim"> {PLAN_INTERVAL_MAP[s.plan.interval]?.toLowerCase()}</span></p>
          {s.price !== null && <p className="text-2xs text-foreground-dim">Preço personalizado</p>}
        </div>
        <div>
          <p className="eyebrow">{s.status === "CANCELED" ? "Cancelada" : s.status === "PAUSED" ? "Pausada" : "Próx. vencimento"}</p>
          <p className="num mt-1 text-foreground">
            {s.status === "CANCELED" ? formatDay(s.canceledAt) : s.status === "PAUSED" ? formatDay(s.pausedAt) : formatDay(s.nextBilling)}
          </p>
          {s.billingDay && <p className="text-2xs text-foreground-dim">Todo dia {s.billingDay}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
        <HistoryDialog s={s} openCharges={openCharges} />
        {canBill && (
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => generateChargeAction({ subscriptionId: s.id }), (d) => (d?.created ? "Cobrança do período gerada" : "A cobrança deste período já existe"))}>
            <FilePlus2 />Gerar cobrança
          </Button>
        )}
        {canBill && <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Pausar" title="Pausar" disabled={pending} onClick={() => run(() => pauseSubscriptionAction({ subscriptionId: s.id }))}><Pause /></Button>}
        {s.status === "PAUSED" && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => resumeSubscriptionAction({ subscriptionId: s.id }))}><Play />Retomar</Button>}
        {s.status !== "CANCELED" && <CancelDialog s={s} />}
      </div>
    </div>
  );
}

function HistoryDialog({ s, openCharges }: { s: Sub; openCharges: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><History />Histórico{openCharges > 0 && <span className="num rounded bg-warning/15 px-1 text-2xs text-warning">{openCharges}</span>}</Button>
      </DialogTrigger>
      <DialogContent title={`${s.plan.name} · ${s.client.name}`} description={`Início ${formatDay(s.startedAt)}${s.notes ? ` · ${s.notes}` : ""}`} className="sm:max-w-xl">
        {s.payments.length === 0 ? (
          <EmptyState icon={History} title="Sem cobranças" description="Use “Gerar cobrança” ou aguarde o ciclo automático (5 dias antes do vencimento)." className="py-8" />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {s.payments.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-foreground">{p.description}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} />
                    <span className="num text-2xs text-foreground-dim">{p.status === "PAID" ? `Pago ${formatDay(p.paidAt)}` : `Vence ${formatDay(p.dueDate)}`}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="num text-sm">{formatCurrency(p.amount)}</span>
                  <PaymentActions payment={p} compact />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ s }: { s: Sub }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await cancelSubscriptionAction({ subscriptionId: s.id, reason: reason || undefined });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Assinatura cancelada");
      setOpen(false);
      router.refresh();
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8 hover:text-danger" aria-label="Cancelar assinatura" title="Cancelar"><XCircle /></Button></DialogTrigger>
      <DialogContent title="Cancelar assinatura" description={`${s.plan.name} de ${s.client.name}. Novas cobranças deixam de ser geradas; cobranças em aberto permanecem.`}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Motivo"><Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Opcional" /></Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Voltar</Button></DialogClose>
            <Button type="submit" variant="danger" loading={pending}>Cancelar assinatura</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
