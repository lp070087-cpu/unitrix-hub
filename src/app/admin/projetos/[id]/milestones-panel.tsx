"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, Circle, CircleDot, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { dayInput, formatDay } from "@/lib/billing/format";
import { cn, MILESTONE_STATUS_MAP } from "@/lib/utils";
import { addMilestoneAction, deleteMilestoneAction, moveMilestoneAction, setMilestoneStatusAction, updateMilestoneAction } from "../actions";

type Milestone = { id: string; title: string; description: string | null; status: string; order: number; dueDate: string | null; completedAt: string | null };

const NEXT: Record<string, string> = { PENDING: "IN_PROGRESS", IN_PROGRESS: "COMPLETED", COMPLETED: "PENDING" };

export function MilestonesPanel({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const done = milestones.filter((m) => m.status === "COMPLETED").length;

  function run(key: string, fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setBusy(key);
    start(async () => {
      const r = await fn();
      setBusy(null);
      if (!r.ok) return void toast.error(r.error);
      if (r.message) toast.success(r.message);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader
        title="Etapas"
        description={milestones.length ? `${done} de ${milestones.length} concluídas` : "Organize a produção em etapas visíveis ao cliente."}
        action={<MilestoneDialog projectId={projectId} />}
      />
      <CardBody className="px-0 pb-2">
        {milestones.length === 0 ? (
          <EmptyState icon={ListChecks} title="Sem etapas" description="Adicione as etapas do projeto. O progresso é calculado automaticamente." className="py-10" />
        ) : (
          <ol className="divide-y divide-border border-t border-border">
            {milestones.map((m, i) => {
              const Icon = m.status === "COMPLETED" ? Check : m.status === "IN_PROGRESS" ? CircleDot : Circle;
              const late = m.status !== "COMPLETED" && m.dueDate && new Date(m.dueDate).getTime() + 86_400_000 < Date.now();
              return (
                <li key={m.id} className="group flex items-start gap-3 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => run(m.id + "s", () => setMilestoneStatusAction({ milestoneId: m.id, status: NEXT[m.status] ?? "PENDING" }))}
                    disabled={pending}
                    aria-label={`Alterar status: ${MILESTONE_STATUS_MAP[m.status]?.label}`}
                    title="Alternar status"
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                      m.status === "COMPLETED" ? "border-success/40 bg-success/15 text-success" : m.status === "IN_PROGRESS" ? "border-accent/40 bg-accent/10 text-accent" : "border-border-strong text-foreground-dim hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm text-foreground", m.status === "COMPLETED" && "text-foreground-muted line-through decoration-foreground-dim/50")}>{m.title}</p>
                    {m.description && <p className="mt-0.5 text-[13px] text-foreground-muted">{m.description}</p>}
                    <div className="mt-1 flex flex-wrap gap-x-3 text-2xs text-foreground-dim num">
                      <span className={MILESTONE_STATUS_MAP[m.status]?.color}>{MILESTONE_STATUS_MAP[m.status]?.label}</span>
                      {m.dueDate && <span className={cn(late && "text-danger")}>Prevista {formatDay(m.dueDate)}</span>}
                      {m.completedAt && <span>Concluída {formatDay(m.completedAt)}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-60 sm:group-hover:opacity-100">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Mover para cima" disabled={i === 0 || pending} onClick={() => run(m.id + "u", () => moveMilestoneAction({ milestoneId: m.id, direction: "up" }))}><ArrowUp /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Mover para baixo" disabled={i === milestones.length - 1 || pending} onClick={() => run(m.id + "d", () => moveMilestoneAction({ milestoneId: m.id, direction: "down" }))}><ArrowDown /></Button>
                    <MilestoneDialog projectId={projectId} milestone={m} />
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8 hover:text-danger" aria-label="Remover etapa" loading={busy === m.id + "x"} disabled={pending}
                      onClick={() => { if (confirm(`Remover a etapa "${m.title}"?`)) run(m.id + "x", () => deleteMilestoneAction({ milestoneId: m.id })); }}
                    >{busy !== m.id + "x" && <Trash2 />}</Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}

function MilestoneDialog({ projectId, milestone }: { projectId: string; milestone?: Milestone }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const initial = () => ({ title: milestone?.title ?? "", description: milestone?.description ?? "", dueDate: dayInput(milestone?.dueDate), status: milestone?.status ?? "PENDING" });
  const [form, setForm] = useState(initial);
  const set = (k: keyof ReturnType<typeof initial>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const payload = { title: form.title, description: form.description, dueDate: form.dueDate || undefined };
      const r = milestone
        ? await updateMilestoneAction({ ...payload, milestoneId: milestone.id, status: form.status })
        : await addMilestoneAction({ ...payload, projectId });
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message ?? "Salvo");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(initial()); }}>
      <DialogTrigger asChild>
        {milestone
          ? <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Editar etapa"><Pencil /></Button>
          : <Button size="sm" variant="secondary"><Plus />Etapa</Button>}
      </DialogTrigger>
      <DialogContent title={milestone ? "Editar etapa" : "Nova etapa"}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título" required><Input value={form.title} onChange={set("title")} required minLength={2} maxLength={160} placeholder="Ex.: Protótipo navegável" /></Field>
          <Field label="Descrição"><Textarea value={form.description} onChange={set("description")} maxLength={2000} className="min-h-[72px]" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data prevista"><Input type="date" value={form.dueDate} onChange={set("dueDate")} /></Field>
            {milestone && (
              <Field label="Status">
                <Select value={form.status} onChange={set("status")}>
                  {Object.entries(MILESTONE_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              </Field>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
            <Button type="submit" variant="accent" loading={pending}>{milestone ? "Salvar" : "Adicionar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
