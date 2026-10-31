"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PROJECT_TYPES, formatDateInput } from "@/lib/utils";
import { createContract, updateDraftContract, type ContractInput } from "./actions";

type ProjectOpt = { id: string; title: string; totalValue: string | number | null; startDate: string | null; endDate: string | null };
export type ClientOpt = { id: string; name: string; company: string | null; projectType: string | null; projects: ProjectOpt[] };

type FormState = {
  clientId: string; projectId: string; title: string; scope: string; value: string; deadline: string;
  startDate: string; endDate: string; deliveryPeriod: string; conditions: string; projectType: string;
};

const empty: FormState = {
  clientId: "", projectId: "", title: "", scope: "", value: "", deadline: "", startDate: "", endDate: "", deliveryPeriod: "", conditions: "", projectType: "",
};

export function ContractForm({ clients, initial, contractId }: { clients: ClientOpt[]; initial?: Partial<FormState>; contractId?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<FormState>({ ...empty, ...initial });
  const client = useMemo(() => clients.find((c) => c.id === form.clientId), [clients, form.clientId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function pickClient(id: string) {
    const c = clients.find((x) => x.id === id);
    setForm((f) => ({ ...f, clientId: id, projectId: "", projectType: f.projectType || c?.projectType || "" }));
  }

  function pickProject(id: string) {
    const p = client?.projects.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      projectId: id,
      ...(p
        ? {
            title: f.title || `Contrato — ${p.title}`,
            value: p.totalValue != null && Number(p.totalValue) > 0 ? String(Number(p.totalValue)) : f.value,
            deadline: p.endDate ? formatDateInput(p.endDate) : f.deadline,
            endDate: p.endDate ? formatDateInput(p.endDate) : f.endDate,
            startDate: p.startDate ? formatDateInput(p.startDate) : f.startDate,
          }
        : {}),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: ContractInput = { ...form };
    start(async () => {
      const res = contractId ? await updateDraftContract(contractId, payload) : await createContract(payload);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Salvo");
      router.push(`/admin/contratos/${res.data?.id ?? contractId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader title="Partes e projeto" description="Os dados do cliente (nome, documento, empresa) são copiados para o contrato no momento da geração." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Cliente" required htmlFor="clientId">
            <Select id="clientId" required value={form.clientId} onChange={(e) => pickClient(e.target.value)}>
              <option value="">Selecione…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>
              ))}
            </Select>
          </Field>
          <Field label="Projeto do cliente" hint="Opcional. Preenche valor e prazo a partir do projeto." htmlFor="projectId">
            <Select id="projectId" value={form.projectId} onChange={(e) => pickProject(e.target.value)} disabled={!client}>
              <option value="">{client ? (client.projects.length ? "Sem projeto vinculado" : "Cliente sem projetos") : "Escolha o cliente primeiro"}</option>
              {client?.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
          </Field>
          <Field label="Título do contrato" required className="sm:col-span-2" htmlFor="title">
            <Input id="title" required minLength={3} maxLength={160} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Desenvolvimento do website institucional" />
          </Field>
          <Field label="Tipo de projeto" htmlFor="projectType">
            <Select id="projectType" value={form.projectType} onChange={(e) => set("projectType", e.target.value)}>
              <option value="">Não informar</option>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              {form.projectType && !PROJECT_TYPES.includes(form.projectType) && <option value={form.projectType}>{form.projectType}</option>}
            </Select>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Escopo" description="Descreva entregáveis, páginas, funcionalidades e o que não está incluído." />
        <CardBody>
          <Field label="Escopo contratado" required htmlFor="scope">
            <Textarea id="scope" required minLength={10} rows={8} value={form.scope} onChange={(e) => set("scope", e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Valor e prazos" description="Pagamento padrão: 50% de entrada e 50% na entrega, com liberação condicionada à quitação." />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Valor total (R$)" required htmlFor="value">
            <Input id="value" required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.value} onChange={(e) => set("value", e.target.value)} className="num" />
          </Field>
          <Field label="Prazo final (deadline)" required htmlFor="deadline">
            <Input id="deadline" required type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </Field>
          <Field label="Período de entrega" hint="Ex.: 45 dias úteis após a entrada" htmlFor="deliveryPeriod">
            <Input id="deliveryPeriod" maxLength={300} value={form.deliveryPeriod} onChange={(e) => set("deliveryPeriod", e.target.value)} />
          </Field>
          <Field label="Início" htmlFor="startDate">
            <Input id="startDate" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label="Fim da vigência" htmlFor="endDate">
            <Input id="endDate" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Condições adicionais" description="Opcional. Vira uma cláusula específica. Separe parágrafos com uma linha em branco." />
        <CardBody>
          <Textarea aria-label="Condições adicionais" rows={5} maxLength={10000} value={form.conditions} onChange={(e) => set("conditions", e.target.value)} />
        </CardBody>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>Cancelar</Button>
        <Button type="submit" variant="accent" loading={pending}>{contractId ? "Salvar rascunho" : "Gerar contrato"}</Button>
      </div>
    </form>
  );
}
