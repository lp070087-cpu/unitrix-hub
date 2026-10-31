"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { createBriefingForClient } from "./actions";

type ClientOpt = { id: string; name: string; company: string | null; projects: { id: string; title: string }[] };

export function AdminNewBriefingDialog({ clients }: { clients: ClientOpt[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const client = clients.find((c) => c.id === clientId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createBriefingForClient({ clientId, projectId, title });
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Criado");
      setOpen(false);
      router.push(`/admin/briefings/${res.data?.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" disabled={!clients.length}><Plus strokeWidth={1.6} /> Novo briefing</Button>
      </DialogTrigger>
      <DialogContent title="Criar briefing para cliente" description="Cria um rascunho que o cliente preenche no portal. Ele será notificado.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Cliente" required htmlFor="ab-client">
            <Select id="ab-client" required value={clientId} onChange={(e) => { setClientId(e.target.value); setProjectId(""); }}>
              <option value="">Selecione…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>)}
            </Select>
          </Field>
          <Field label="Projeto (sem briefing)" hint="Opcional" htmlFor="ab-project">
            <Select id="ab-project" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={!client?.projects.length}>
              <option value="">{client?.projects.length ? "Sem vínculo" : "Nenhum projeto disponível"}</option>
              {client?.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
          </Field>
          <Field label="Título" required htmlFor="ab-title">
            <Input id="ab-title" required minLength={3} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="flex justify-end pt-2"><Button type="submit" variant="accent" loading={pending}>Criar briefing</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
