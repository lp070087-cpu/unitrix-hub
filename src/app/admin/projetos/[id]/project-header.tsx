"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Progress } from "@/components/ui/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";
import { dayInput } from "@/lib/billing/format";
import { formatCurrency, PROJECT_STATUS_MAP } from "@/lib/utils";
import { updateProjectInfoAction, updateProjectStatusAction } from "../actions";

type Project = {
  id: string; title: string; description: string | null; status: string; progress: number;
  startDate: string | null; endDate: string | null; totalValue: string | null; stageChangedAt: string | null;
  client: { id: string; name: string; company: string | null; email: string };
  milestonesCount: number;
};

const SELECTABLE = Object.entries(PROJECT_STATUS_MAP).filter(([k]) => k !== "DELIVERED");

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function changeStatus(status: string) {
    start(async () => {
      const r = await updateProjectStatusAction({ projectId: project.id, status });
      if (!r.ok) return void toast.error(r.error);
      toast.success("Status atualizado e cliente notificado");
      router.refresh();
    });
  }

  const done = project.status === "COMPLETED" || project.status === "DELIVERED";

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge map={PROJECT_STATUS_MAP} status={project.status} />
            {project.totalValue && <span className="num text-xs text-foreground-muted">{formatCurrency(project.totalValue)}</span>}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-[28px]">{project.title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {project.client.name}{project.client.company ? ` · ${project.client.company}` : ""}
          </p>
          {project.description && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground-muted">{project.description}</p>}
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-60">
              <label className="eyebrow mb-1.5 block" htmlFor="project-status">Etapa</label>
              {project.status === "DELIVERED" ? (
                <p className="text-sm text-foreground-muted">Entregue — liberação concluída.</p>
              ) : (
                <Select id="project-status" value={project.status} disabled={pending} onChange={(e) => changeStatus(e.target.value)}>
                  {SELECTABLE.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              )}
            </div>
            <EditProjectDialog project={project} />
          </div>
        </div>
        <div className="space-y-5 rounded-lg border border-border bg-surface-sunken p-4">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Progresso</span>
              <span className="num text-xl font-semibold text-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="mt-2.5" />
            <p className="mt-2 text-2xs text-foreground-dim">{project.milestonesCount ? "Calculado pelas etapas concluídas" : "Adicione etapas para medir o progresso"}</p>
          </div>
          <TimelinePrazo startDate={project.startDate} endDate={project.endDate} completed={done} label="Prazo" />
        </div>
      </div>
    </Card>
  );
}

function EditProjectDialog({ project }: { project: Project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const initial = () => ({
    title: project.title, description: project.description ?? "", startDate: dayInput(project.startDate), endDate: dayInput(project.endDate),
    totalValue: project.totalValue ? String(Number(project.totalValue).toFixed(2)).replace(".", ",") : "",
  });
  const [form, setForm] = useState(initial);
  const set = (k: keyof ReturnType<typeof initial>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await updateProjectInfoAction({ projectId: project.id, ...form, startDate: form.startDate || undefined, endDate: form.endDate || undefined, totalValue: form.totalValue || undefined });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Projeto atualizado");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(initial()); }}>
      <DialogTrigger asChild><Button variant="outline"><Pencil />Editar</Button></DialogTrigger>
      <DialogContent title="Editar projeto" className="sm:max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título" required><Input value={form.title} onChange={set("title")} required maxLength={160} /></Field>
          <Field label="Descrição"><Textarea value={form.description} onChange={set("description")} maxLength={5000} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Início"><Input type="date" value={form.startDate} onChange={set("startDate")} /></Field>
            <Field label="Entrega prevista"><Input type="date" value={form.endDate} min={form.startDate || undefined} onChange={set("endDate")} /></Field>
          </div>
          <Field label="Valor total (R$)" hint="Alterar o valor não recalcula cobranças já geradas.">
            <Input inputMode="decimal" value={form.totalValue} onChange={set("totalValue")} className="num" placeholder="0,00" />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
            <Button type="submit" variant="accent" loading={pending}>Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
