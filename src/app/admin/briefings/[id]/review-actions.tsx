"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Select, Textarea } from "@/components/ui/field";
import { approveBriefing, linkBriefingProject, requestBriefingRevision } from "../actions";

export function ReviewActions({ id, status, projectId, projects }: { id: string; status: string; projectId: string | null; projects: { id: string; title: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(projectId ?? "");

  function run(key: string, fn: () => Promise<{ ok: true; message?: string } | { ok: false; error: string }>, after?: () => void) {
    setBusy(key);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Feito");
      after?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        {status === "SUBMITTED" && (
          <Button variant="accent" loading={pending && busy === "approve"} onClick={() => run("approve", () => approveBriefing(id))}>
            <Check strokeWidth={1.6} /> Aprovar briefing
          </Button>
        )}
        {(status === "SUBMITTED" || status === "APPROVED") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><MessageSquareWarning strokeWidth={1.6} /> Solicitar ajustes</Button>
            </DialogTrigger>
            <DialogContent title="Solicitar ajustes" description="O cliente verá esta nota e poderá editar e reenviar o briefing.">
              <Field label="O que precisa ser ajustado?" required htmlFor="rv-note">
                <Textarea id="rv-note" rows={5} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button variant="accent" disabled={note.trim().length < 5} loading={pending && busy === "rev"} onClick={() => run("rev", () => requestBriefingRevision(id, note), () => { setOpen(false); setNote(""); })}>
                  Enviar solicitação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {(status === "DRAFT" || status === "REVISION_REQUESTED") && (
          <p className="text-[13px] text-foreground-muted">Aguardando o cliente {status === "DRAFT" ? "preencher e enviar" : "ajustar e reenviar"}.</p>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <Field label="Projeto vinculado" hint="Apenas projetos do mesmo cliente sem outro briefing." htmlFor="rv-project">
          <Select id="rv-project" value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">Sem vínculo</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>
        </Field>
        <Button className="mt-3" size="sm" variant="secondary" disabled={project === (projectId ?? "")} loading={pending && busy === "link"} onClick={() => run("link", () => linkBriefingProject(id, project || null))}>
          Salvar vínculo
        </Button>
      </div>
    </div>
  );
}
