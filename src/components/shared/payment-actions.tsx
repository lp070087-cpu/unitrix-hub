"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { confirmPaymentAction, cancelPaymentAction } from "@/app/admin/financeiro/actions";
import { formatCurrency } from "@/lib/utils";

export const PAYMENT_METHOD_OPTIONS: [string, string][] = [
  ["PIX", "Pix"], ["BOLETO", "Boleto"], ["TRANSFER", "Transferência"], ["CARD", "Cartão"], ["CASH", "Dinheiro"], ["OTHER", "Outro"],
];

type P = { id: string; status: string; amount: string | number; description: string };

function todayInput() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

/** Ações administrativas de uma cobrança: confirmar recebimento e cancelar. */
export function PaymentActions({ payment, compact }: { payment: P; compact?: boolean }) {
  const open = payment.status === "PENDING" || payment.status === "OVERDUE";
  if (!open) return null;
  return (
    <div className="flex items-center justify-end gap-1.5">
      <ConfirmPaymentDialog payment={payment} compact={compact} />
      <CancelPaymentDialog payment={payment} />
    </div>
  );
}

function ConfirmPaymentDialog({ payment, compact }: { payment: P; compact?: boolean }) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [method, setMethod] = useState("PIX");
  const [paidAt, setPaidAt] = useState(todayInput);
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    start(async () => {
      const r = await confirmPaymentAction({ paymentId: payment.id, method, paidAt, notes: notes || undefined });
      if (!r.ok) return void toast.error(r.error);
      if (r.data?.alreadyConfirmed) toast.info("Este pagamento já estava confirmado");
      else toast.success("Pagamento confirmado");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" aria-label="Confirmar pagamento">
          <Check />{!compact && <span>Confirmar</span>}
        </Button>
      </DialogTrigger>
      <DialogContent title="Confirmar pagamento" description={`${payment.description} · ${formatCurrency(payment.amount)}`}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Forma de pagamento" required>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAYMENT_METHOD_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Data do recebimento">
              <Input type="date" value={paidAt} max={todayInput()} onChange={(e) => setPaidAt(e.target.value)} />
            </Field>
          </div>
          <Field label="Observações" hint="Opcional. Visível apenas para a equipe.">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} className="min-h-[72px]" />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Voltar</Button></DialogClose>
            <Button type="submit" variant="accent" loading={pending}>Confirmar recebimento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelPaymentDialog({ payment }: { payment: P }) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    start(async () => {
      const r = await cancelPaymentAction({ paymentId: payment.id, reason: reason || undefined });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Cobrança cancelada");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Cancelar cobrança"><X /></Button>
      </DialogTrigger>
      <DialogContent title="Cancelar cobrança" description={`${payment.description} · ${formatCurrency(payment.amount)}. Esta ação não pode ser desfeita.`}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Motivo" hint="Opcional. Registrado nas observações internas.">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Voltar</Button></DialogClose>
            <Button type="submit" variant="danger" loading={pending}>Cancelar cobrança</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
