"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { createPresentation } from "./actions";

type ClientOpt = { id: string; name: string; company: string | null; projects: { id: string; title: string }[] };

export function NewPresentationDialog({ clients }: { clients: ClientOpt[] }) {
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
      const res = await createPresentation({ clientId, projectId, title });
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Criada");
      setOpen(false);
      router.push(`/admin/apresentacoes/${res.data?.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" disabled={clients.length === 0}><Plus strokeWidth={1.6} /> Nova apresentação</Button>
      </DialogTrigger>
      <DialogContent title="Nova apresentação" description="Começa com uma estrutura editável em rascunho. Nada é enviado ao cliente até você decidir.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Cliente" required htmlFor="np-client">
            <Select id="np-client" required value={clientId} onChange={(e) => { setClientId(e.target.value); setProjectId(""); }}>
              <option value="">Selecione…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>)}
            </Select>
          </Field>
          <Field label="Projeto" hint="Opcional" htmlFor="np-project">
            <Select id="np-project" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={!client?.projects.length}>
              <option value="">{client?.projects.length ? "Sem projeto" : "Nenhum projeto disponível"}</option>
              {client?.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
          </Field>
          <Field label="Título" required htmlFor="np-title">
            <Input id="np-title" required minLength={3} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Nova plataforma de agendamentos" />
          </Field>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="accent" loading={pending}>Criar e editar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
