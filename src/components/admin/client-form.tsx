"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { CLIENT_STATUS_MAP, PROJECT_TYPES } from "@/lib/utils";
import { createClient, updateClient } from "@/app/admin/clientes/actions";

type Initial = Partial<Record<"name" | "company" | "document" | "email" | "phone" | "address" | "city" | "segment" | "projectType" | "status", string>> & { budget?: string | number | null; leadId?: string; notes?: string };

export function ClientForm({ clientId, initial = {}, hasAccess }: { clientId?: string; initial?: Initial; hasAccess?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = clientId ? await updateClient(clientId, fd) : await createClient(fd);
    setPending(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    const id = clientId ?? (res.data as { id: string } | undefined)?.id;
    router.push(id ? `/admin/clientes/${id}` : "/admin/clientes");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {initial.leadId && <input type="hidden" name="leadId" value={initial.leadId} />}
      <Card className="p-5 sm:p-6">
        <p className="eyebrow mb-5">Identificação</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do responsável" required htmlFor="name"><Input id="name" name="name" required minLength={2} defaultValue={initial.name} autoComplete="off" /></Field>
          <Field label="Empresa" htmlFor="company"><Input id="company" name="company" defaultValue={initial.company} /></Field>
          <Field label="E-mail" required htmlFor="email" hint="Usado para acesso ao portal"><Input id="email" name="email" type="email" required defaultValue={initial.email} /></Field>
          <Field label="WhatsApp / telefone" htmlFor="phone"><Input id="phone" name="phone" inputMode="tel" defaultValue={initial.phone} /></Field>
          <Field label="CPF / CNPJ" htmlFor="document"><Input id="document" name="document" defaultValue={initial.document} /></Field>
          <Field label="Segmento" htmlFor="segment"><Input id="segment" name="segment" defaultValue={initial.segment} /></Field>
          <Field label="Endereço" htmlFor="address" className="sm:col-span-2"><Input id="address" name="address" defaultValue={initial.address} /></Field>
          <Field label="Cidade" htmlFor="city"><Input id="city" name="city" defaultValue={initial.city} /></Field>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="eyebrow mb-5">Relacionamento</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={initial.status || "LEAD"}>
              {Object.entries(CLIENT_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </Field>
          <Field label="Tipo de projeto" htmlFor="projectType">
            <Select id="projectType" name="projectType" defaultValue={initial.projectType || ""}>
              <option value="">Não definido</option>
              {[...new Set([...(initial.projectType ? [initial.projectType] : []), ...PROJECT_TYPES])].map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Orçamento estimado (R$)" htmlFor="budget"><Input id="budget" name="budget" inputMode="decimal" defaultValue={initial.budget ?? ""} placeholder="0,00" /></Field>
        </div>
        {initial.notes && (
          <Field label="Descrição da solicitação" className="mt-4"><Textarea readOnly value={initial.notes} className="text-foreground-muted" /></Field>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="eyebrow mb-1">Acesso ao portal</p>
        <p className="mb-5 text-[13px] text-foreground-muted">
          {hasAccess ? "O cliente já possui acesso. Preencha apenas para redefinir a senha." : "Defina uma senha para liberar o acesso do cliente ao portal. Compartilhe-a por um canal seguro."}
        </p>
        <Field label={hasAccess ? "Nova senha" : "Senha de acesso"} htmlFor="password" hint="Mínimo de 8 caracteres" className="max-w-sm">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} />
        </Field>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={pending}>{clientId ? "Salvar alterações" : "Cadastrar cliente"}</Button>
      </div>
    </form>
  );
}
