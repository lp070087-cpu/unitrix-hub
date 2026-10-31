"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { createClientBriefing } from "./actions";

export function NewBriefingDialog({ projects }: { projects: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createClientBriefing({ title, projectId });
      if (!res.ok) return void toast.error(res.error);
      setOpen(false);
      router.push(`/cliente/briefing/${res.data?.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent"><Plus strokeWidth={1.6} /> Novo briefing</Button>
      </DialogTrigger>
      <DialogContent title="Novo briefing" description="Você pode preencher aos poucos e salvar como rascunho.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome do briefing" required htmlFor="nb-title">
            <Input id="nb-title" required minLength={3} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Novo site institucional" />
          </Field>
          {projects.length > 0 && (
            <Field label="Vincular a um projeto" hint="Opcional" htmlFor="nb-project">
              <Select id="nb-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Sem vínculo</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
          )}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="accent" loading={pending}>Começar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
