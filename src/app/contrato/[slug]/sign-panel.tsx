"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, PenLine, ShieldCheck } from "lucide-react";
import { SignaturePad } from "@/components/documents/signature-pad";
import { formatCpfCnpj, isValidCpfOrCnpj, onlyDigits } from "@/lib/contracts/document-id";
import { cn } from "@/lib/utils";
import { confirmContractRead, signContract } from "./actions";

export function SignPanel({ slug, defaultName, readConfirmed: initialRead }: { slug: string; defaultName: string; readConfirmed: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [read, setRead] = useState(initialRead);
  const [readSaving, setReadSaving] = useState(false);
  const [terms, setTerms] = useState(false);
  const [name, setName] = useState(defaultName);
  const [doc, setDoc] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const docDigits = onlyDigits(doc);
  const docValid = isValidCpfOrCnpj(doc);
  const nameValid = name.trim().split(/\s+/).length >= 2 && name.trim().length >= 5;
  const ready = read && terms && nameValid && docValid && !!signature;

  async function toggleRead(v: boolean) {
    if (!v || read) return;
    setReadSaving(true);
    const res = await confirmContractRead(slug);
    setReadSaving(false);
    if (!res.ok) return void toast.error(res.error);
    setRead(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ready || !signature) return;
    start(async () => {
      const res = await signContract({ slug, readConfirmed: true, termsAccepted: true, signerName: name, signerDocument: doc, signatureData: signature });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        router.refresh();
        return;
      }
      toast.success(res.message ?? "Contrato assinado");
      router.refresh();
    });
  }

  return (
    <section className="no-print mx-auto mt-8 w-full max-w-[860px] rounded-lg bg-paper text-paper-ink shadow-lift" aria-labelledby="assinar">
      <div className="border-b border-paper-line px-6 py-6 sm:px-12">
        <p className="font-mono text-2xs uppercase tracking-[0.18em] text-paper-muted">Aceite eletrônico</p>
        <h2 id="assinar" className="mt-2 font-display text-[32px] leading-tight">Assinar contrato</h2>
        <p className="mt-2 max-w-xl text-sm text-paper-muted">
          Ao assinar, registramos data e hora, IP, navegador e um código de integridade do documento como evidências do aceite.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-8 px-6 py-8 sm:px-12">
        <Step n={1} done={read} title="Confirmação de leitura">
          <label className="flex cursor-pointer items-start gap-3 text-[15px]">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-accent-deep" checked={read} disabled={read || readSaving} onChange={(e) => toggleRead(e.target.checked)} />
            <span>Li integralmente este contrato, versão atual, e compreendi todas as cláusulas.{readSaving && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" />}</span>
          </label>
        </Step>

        <Step n={2} done={terms} title="Aceite dos termos" disabled={!read}>
          <label className="flex cursor-pointer items-start gap-3 text-[15px]">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-accent-deep" checked={terms} disabled={!read} onChange={(e) => setTerms(e.target.checked)} />
            <span>Aceito os termos e concordo em assinar eletronicamente, reconhecendo este meio como válido para comprovar a autoria e a integridade do documento.</span>
          </label>
        </Step>

        <Step n={3} done={nameValid && docValid} title="Identificação do signatário" disabled={!terms}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-paper-muted">Nome completo</span>
              <input
                className="h-11 w-full rounded-md border border-paper-line bg-white px-3 text-paper-ink focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent-deep/20"
                value={name} onChange={(e) => setName(e.target.value)} disabled={!terms} autoComplete="name" maxLength={160}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-paper-muted">CPF ou CNPJ</span>
              <input
                className={cn(
                  "num h-11 w-full rounded-md border bg-white px-3 text-paper-ink focus:outline-none focus:ring-2",
                  docDigits.length >= 11 && !docValid ? "border-danger focus:ring-danger/20" : "border-paper-line focus:border-accent-deep focus:ring-accent-deep/20"
                )}
                value={doc} onChange={(e) => setDoc(formatCpfCnpj(e.target.value))} disabled={!terms} inputMode="numeric" placeholder="000.000.000-00"
                aria-invalid={docDigits.length >= 11 && !docValid}
              />
              {docDigits.length >= 11 && !docValid && <span className="mt-1 block text-xs text-danger">Documento inválido. Verifique os dígitos.</span>}
            </label>
          </div>
        </Step>

        <Step n={4} done={!!signature} title="Assinatura" disabled={!terms}>
          <SignaturePad onChange={setSignature} disabled={!terms} />
        </Step>

        {error && <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-paper-ink">{error}</p>}

        <div className="flex flex-col gap-3 border-t border-paper-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-paper-muted"><ShieldCheck className="h-4 w-4" strokeWidth={1.6} /> Conexão autenticada · evidências registradas</p>
          <button
            type="submit"
            disabled={!ready || pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-paper-ink px-6 text-[15px] font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" strokeWidth={1.6} />}
            Assinar contrato
          </button>
        </div>
      </form>
    </section>
  );
}

function Step({ n, title, done, disabled, children }: { n: number; title: string; done?: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className={cn("transition-opacity", disabled && "opacity-50")} disabled={disabled}>
      <legend className="mb-3 flex items-center gap-3">
        <span className={cn("grid h-6 w-6 place-items-center rounded-full border text-xs font-mono", done ? "border-accent-deep bg-accent-deep text-white" : "border-paper-line text-paper-muted")}>
          {done ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : n}
        </span>
        <span className="font-medium">{title}</span>
      </legend>
      <div className="pl-0 sm:pl-9">{children}</div>
    </fieldset>
  );
}
