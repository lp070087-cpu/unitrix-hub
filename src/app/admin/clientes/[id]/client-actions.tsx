"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import * as DM from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CLIENT_STATUS_MAP } from "@/lib/utils";
import { deleteClient, revokeClientAccess, updateClientStatus } from "../actions";

export function ClientActions({ id, status, hasAccess }: { id: string; status: string; hasAccess: boolean }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<null | "delete" | "revoke">(null);
  const [busy, setBusy] = useState(false);

  async function run(p: Promise<{ ok: boolean; error?: string; message?: string }>, after?: () => void) {
    setBusy(true);
    const r = await p;
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(r.message);
    setConfirm(null);
    after?.();
    router.refresh();
  }

  const item = "flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-[13px] text-foreground-muted outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground";

  return (
    <>
      <DM.Root>
        <DM.Trigger asChild><Button variant="outline" size="icon" aria-label="Mais ações"><MoreHorizontal /></Button></DM.Trigger>
        <DM.Portal>
          <DM.Content align="end" sideOffset={6} className="z-50 min-w-[220px] rounded-md border border-border bg-surface-raised p-1 shadow-lift">
            <DM.Label className="px-2.5 py-1.5 eyebrow">Alterar status</DM.Label>
            {Object.entries(CLIENT_STATUS_MAP).filter(([k]) => k !== status).map(([k, v]) => (
              <DM.Item key={k} className={item} onSelect={() => run(updateClientStatus(id, k))}>{v.label}</DM.Item>
            ))}
            <DM.Separator className="my-1 h-px bg-border" />
            {hasAccess && <DM.Item className={item} onSelect={() => setConfirm("revoke")}>Revogar acesso ao portal</DM.Item>}
            <DM.Item className={`${item} data-[highlighted]:text-danger`} onSelect={() => setConfirm("delete")}>Excluir cliente</DM.Item>
          </DM.Content>
        </DM.Portal>
      </DM.Root>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent
          title={confirm === "delete" ? "Excluir cliente?" : "Revogar acesso?"}
          description={confirm === "delete" ? "Só é possível excluir clientes sem projetos, contratos ou cobranças. A ação não pode ser desfeita." : "O cliente deixará de conseguir entrar no portal até que uma nova senha seja definida."}
        >
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button variant="danger" loading={busy} onClick={() => confirm === "delete" ? run(deleteClient(id), () => router.push("/admin/clientes")) : run(revokeClientAccess(id))}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
