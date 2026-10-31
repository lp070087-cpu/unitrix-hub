"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, ExternalLink, GitBranchPlus, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CopyLinkButton } from "@/components/documents/copy-link-button";
import { cancelContract, createContractVersion, sendContract } from "../actions";

export function ContractActions({ id, slug, status, hasNext }: { id: string; slug: string; status: string; hasNext: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const canEdit = status === "DRAFT";
  const canSend = ["DRAFT", "SENT", "VIEWED"].includes(status);
  const canVersion = ["SENT", "VIEWED", "SIGNED"].includes(status) && !hasNext;
  const canCancel = ["DRAFT", "SENT", "VIEWED"].includes(status);

  function run<T>(key: string, fn: () => Promise<{ ok: true; data?: T; message?: string } | { ok: false; error: string }>, after?: (data?: T) => void) {
    setBusy(key);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Feito");
      after?.(res.data);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && (
        <Button asChild variant="outline" size="sm"><Link href={`/admin/contratos/${id}/editar`}><Pencil strokeWidth={1.6} /> Editar</Link></Button>
      )}
      {canSend && (
        <Button variant="accent" size="sm" loading={pending && busy === "send"} onClick={() => run("send", () => sendContract(id))}>
          <Send strokeWidth={1.6} /> {status === "DRAFT" ? "Enviar ao cliente" : "Reenviar aviso"}
        </Button>
      )}
      {canVersion && (
        <Button variant="secondary" size="sm" loading={pending && busy === "version"} onClick={() => run("version", () => createContractVersion(id), (d) => d?.id && router.push(`/admin/contratos/${d.id}/editar`))}>
          <GitBranchPlus strokeWidth={1.6} /> {status === "SIGNED" ? "Criar aditivo (nova versão)" : "Nova versão"}
        </Button>
      )}
      <CopyLinkButton path={`/contrato/${slug}`} />
      <Button asChild variant="ghost" size="sm"><a href={`/contrato/${slug}`} target="_blank" rel="noreferrer"><ExternalLink strokeWidth={1.6} /> Abrir documento</a></Button>
      {canCancel && (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button variant="danger" size="sm"><Ban strokeWidth={1.6} /> Cancelar</Button>
          </DialogTrigger>
          <DialogContent title="Cancelar contrato?" description="O contrato deixa de poder ser assinado. Esta ação fica registrada na linha do tempo e não pode ser desfeita.">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild><Button variant="ghost">Voltar</Button></DialogClose>
              <Button variant="danger" loading={pending && busy === "cancel"} onClick={() => run("cancel", () => cancelContract(id), () => setCancelOpen(false))}>Confirmar cancelamento</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
