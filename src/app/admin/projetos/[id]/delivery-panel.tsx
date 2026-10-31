"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, Lock, Plus, Rocket, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusBadge } from "@/components/shared/status-badge";
import { DELIVERY_STATUS_MAP, formatDateTime } from "@/lib/utils";
import { releaseDeliveryAction, saveDeliveryAction } from "../actions";

type Delivery = {
  status: string; link: string | null; documentation: string | null; notes: string | null; releasedAt: string | null;
  credentials: { label: string; value: string }[];
};

export function DeliveryPanel({ projectId, delivery, releasable, blockedReason }: { projectId: string; delivery: Delivery | null; releasable: boolean; blockedReason: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [releasing, startRelease] = useTransition();
  const released = delivery?.status === "RELEASED";
  const [form, setForm] = useState({
    status: delivery?.status === "READY" ? "READY" : "BLOCKED",
    link: delivery?.link ?? "",
    documentation: delivery?.documentation ?? "",
    notes: delivery?.notes ?? "",
  });
  const [creds, setCreds] = useState(delivery?.credentials ?? []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveDeliveryAction({
        projectId, status: form.status as "BLOCKED" | "READY", link: form.link, documentation: form.documentation, notes: form.notes,
        credentials: creds.filter((c) => c.label.trim() && c.value.trim()),
      });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Entrega salva");
      router.refresh();
    });
  }

  function release() {
    if (!confirm("Liberar a entrega para o cliente? O projeto será marcado como entregue.")) return;
    startRelease(async () => {
      const r = await releaseDeliveryAction({ projectId });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.data?.alreadyReleased ? "A entrega já estava liberada" : "Entrega liberada e cliente notificado");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader title="Entrega" description="Link, documentação e acessos do projeto." action={delivery && <StatusBadge map={DELIVERY_STATUS_MAP} status={delivery.status} />} />
      <CardBody className="space-y-4">
        {released ? (
          <div className="flex items-start gap-3 rounded-md border border-success/25 bg-success/[0.06] p-3 text-[13px]">
            <Unlock className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.6} />
            <p className="text-foreground-muted">Liberada em <span className="num text-foreground">{formatDateTime(delivery?.releasedAt)}</span>. O cliente tem acesso ao link, documentação e credenciais.</p>
          </div>
        ) : releasable ? (
          <div className="flex items-start gap-3 rounded-md border border-border bg-surface-sunken p-3 text-[13px]">
            <Unlock className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
            <p className="text-foreground-muted">Entrada e saldo quitados. A entrega pode ser liberada.</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-md border border-warning/25 bg-warning/[0.06] p-3 text-[13px]">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.6} />
            <p className="text-foreground-muted">{blockedReason ?? "Liberação bloqueada até a quitação."}</p>
          </div>
        )}

        <form onSubmit={save} className="space-y-4">
          {!released && (
            <Field label="Situação">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="BLOCKED">Em preparação (bloqueada)</option>
                <option value="READY">Pronta para liberação</option>
              </Select>
            </Field>
          )}
          <Field label="Link da entrega"><Input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://" maxLength={500} /></Field>
          <Field label="Documentação" hint="Instruções de uso, publicação e manutenção. Visível ao cliente após a liberação.">
            <Textarea value={form.documentation} onChange={(e) => setForm({ ...form, documentation: e.target.value })} maxLength={20000} />
          </Field>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted"><KeyRound className="h-3.5 w-3.5" strokeWidth={1.6} />Credenciais</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setCreds([...creds, { label: "", value: "" }])} disabled={creds.length >= 30}><Plus />Adicionar</Button>
            </div>
            {creds.length === 0 ? (
              <p className="text-xs text-foreground-dim">Nenhuma credencial. Exibidas ao cliente somente após a liberação.</p>
            ) : (
              <div className="space-y-2">
                {creds.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={c.label} onChange={(e) => setCreds(creds.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Ex.: Painel admin" className="w-2/5" maxLength={120} aria-label="Rótulo" />
                    <Input value={c.value} onChange={(e) => setCreds(creds.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="usuário / senha" className="num flex-1" maxLength={1000} aria-label="Valor" autoComplete="off" />
                    <Button type="button" size="icon" variant="ghost" className="shrink-0 hover:text-danger" aria-label="Remover credencial" onClick={() => setCreds(creds.filter((_, j) => j !== i))}><Trash2 /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Field label="Notas da entrega" hint="Visíveis ao cliente após a liberação.">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={5000} className="min-h-[72px]" />
          </Field>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="submit" variant="secondary" loading={pending}>Salvar entrega</Button>
            {!released && (
              <Button type="button" variant="accent" onClick={release} loading={releasing} disabled={!releasable} title={releasable ? undefined : blockedReason ?? undefined}>
                <Rocket />Liberar entrega
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
