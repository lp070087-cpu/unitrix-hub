"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Receipt, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentActions } from "@/components/shared/payment-actions";
import { NewChargeDialog } from "@/components/shared/new-charge-dialog";
import { formatDay } from "@/lib/billing/format";
import { formatCurrency, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, toNumber } from "@/lib/utils";
import { generateProjectChargesAction } from "../actions";

type Payment = { id: string; description: string; amount: string; type: string; status: string; dueDate: string | null; paidAt: string | null; method: string | null; confirmedBy: string | null };

export function FinancePanel({ project, payments }: { project: { id: string; clientId: string; totalValue: string | null }; payments: Payment[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const active = payments.filter((p) => p.status !== "CANCELLED");
  const paid = active.filter((p) => p.status === "PAID").reduce((s, p) => s + toNumber(p.amount), 0);
  const open = active.filter((p) => p.status !== "PAID").reduce((s, p) => s + toNumber(p.amount), 0);
  const has5050 = payments.some((p) => p.type === "DEPOSIT" || p.type === "FINAL_BALANCE");
  const canGenerate = !has5050 && toNumber(project.totalValue) > 0;

  function generate() {
    start(async () => {
      const r = await generateProjectChargesAction({ projectId: project.id });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.data?.created ? "Cobranças 50/50 geradas" : "As cobranças já existiam");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader title="Financeiro" description={project.totalValue ? `Valor total ${formatCurrency(project.totalValue)}` : "Sem valor total definido"} action={<NewChargeDialog fixed={{ clientId: project.clientId, projectId: project.id }} triggerLabel="Avulsa" size="sm" />} />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
          <div className="bg-surface-sunken p-3"><p className="eyebrow">Recebido</p><p className="num mt-1 text-[15px] text-success">{formatCurrency(paid)}</p></div>
          <div className="bg-surface-sunken p-3"><p className="eyebrow">Em aberto</p><p className="num mt-1 text-[15px] text-foreground">{formatCurrency(open)}</p></div>
        </div>
        {canGenerate && (
          <Button variant="outline" className="w-full" onClick={generate} loading={pending}><SplitSquareHorizontal />Gerar cobranças 50/50</Button>
        )}
        {payments.length === 0 ? (
          <EmptyState icon={Receipt} title="Sem cobranças" description="Defina o valor do projeto para gerar entrada e saldo, ou crie uma cobrança avulsa." className="py-6" />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{PAYMENT_TYPE_MAP[p.type] ?? p.type}</span>
                    <StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} />
                  </div>
                  {p.type === "EXTRA" && <p className="mt-0.5 truncate text-xs text-foreground-muted">{p.description}</p>}
                  <p className="num mt-1 text-2xs text-foreground-dim">
                    {p.status === "PAID" ? `Pago ${formatDay(p.paidAt)}${p.confirmedBy ? ` · ${p.confirmedBy}` : ""}` : p.dueDate ? `Vence ${formatDay(p.dueDate)}` : "Sem vencimento"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="num text-sm text-foreground">{formatCurrency(p.amount)}</span>
                  <PaymentActions payment={p} compact />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
