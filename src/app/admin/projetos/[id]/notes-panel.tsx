"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { updateInternalNotesAction } from "../actions";

export function NotesPanel({ projectId, notes }: { projectId: string; notes: string }) {
  const [value, setValue] = useState(notes);
  const [saved, setSaved] = useState(notes);
  const [pending, start] = useTransition();
  const dirty = value !== saved;

  function save() {
    start(async () => {
      const r = await updateInternalNotesAction({ projectId, internalNotes: value });
      if (!r.ok) return void toast.error(r.error);
      setSaved(value);
      toast.success("Notas salvas");
    });
  }

  return (
    <Card>
      <CardHeader
        title={<span className="inline-flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-foreground-dim" strokeWidth={1.6} />Notas internas</span>}
        description="Nunca são exibidas ao cliente."
      />
      <CardBody className="space-y-3">
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} maxLength={20000} placeholder="Decisões, acessos pendentes, riscos…" className="min-h-[120px]" />
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={save} disabled={!dirty} loading={pending}>Salvar notas</Button>
        </div>
      </CardBody>
    </Card>
  );
}
