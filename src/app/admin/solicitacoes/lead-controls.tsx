"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { LEAD_STATUS_MAP } from "@/lib/utils";
import { updateLead } from "./actions";

export function LeadControls({ id, status, notes }: { id: string; status: string; notes: string }) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes);
  const [busy, setBusy] = useState(false);
  const dirty = s !== status || n !== notes;

  async function save() {
    setBusy(true);
    const r = await updateLead(id, { status: s, notes: n });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(r.message);
    router.refresh();
  }

  return (
    <div className="w-full space-y-2 lg:w-72">
      <Select value={s} onChange={(e) => setS(e.target.value)} aria-label="Status da solicitação">
        {Object.entries(LEAD_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
      <Textarea value={n} onChange={(e) => setN(e.target.value)} placeholder="Anotações internas" className="min-h-[72px]" aria-label="Anotações internas" />
      {dirty && <Button size="sm" className="w-full" loading={busy} onClick={save}>Salvar</Button>}
    </div>
  );
}
