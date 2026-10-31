"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { submitLead, type LeadActionState, type LeadField } from "@/app/actions/lead";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { BUDGET_RANGES, PROJECT_TYPES } from "@/lib/utils";

function LeadFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState<LeadActionState, FormData>(submitLead, null);
  const startedRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [descLen, setDescLen] = useState(0);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      statusRef.current?.focus();
      return;
    }
    const first = state.fieldErrors && (Object.keys(state.fieldErrors)[0] as LeadField | undefined);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    else statusRef.current?.focus();
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const err = (k: LeadField) => errors[k];
  const aria = (k: LeadField) =>
    err(k) ? { "aria-invalid": true as const, "aria-describedby": `lead-${k}-error` } : {};

  if (state?.ok) {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="flex min-h-[420px] flex-col items-start justify-center outline-none">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <h3 className="mt-6 font-display text-4xl leading-tight">Solicitação recebida.</h3>
        <p className="mt-3 max-w-md text-pretty leading-relaxed text-foreground-muted">
          {state.message} Vamos analisar o que você descreveu e retornar pelo e-mail ou WhatsApp informado.
        </p>
        <Button variant="outline" className="mt-8" onClick={onReset}>
          Enviar outra solicitação
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="space-y-5"
      aria-describedby={state && !state.ok ? "lead-status" : undefined}
    >
      {/* Anti-spam */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-website">Não preencha este campo</label>
        <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" htmlFor="lead-name" required error={err("name")}>
          <Input id="lead-name" name="name" autoComplete="name" maxLength={120} required {...aria("name")} />
        </Field>
        <Field label="Empresa" htmlFor="lead-company" error={err("company")}>
          <Input id="lead-company" name="company" autoComplete="organization" maxLength={120} {...aria("company")} />
        </Field>
        <Field label="WhatsApp" htmlFor="lead-whatsapp" required error={err("whatsapp")} hint="Com DDD">
          <Input
            id="lead-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 90000-0000"
            maxLength={30}
            required
            {...aria("whatsapp")}
          />
        </Field>
        <Field label="E-mail" htmlFor="lead-email" required error={err("email")}>
          <Input id="lead-email" name="email" type="email" autoComplete="email" maxLength={160} required {...aria("email")} />
        </Field>
        <Field label="Tipo de projeto" htmlFor="lead-projectType" required error={err("projectType")}>
          <Select id="lead-projectType" name="projectType" defaultValue="" required {...aria("projectType")}>
            <option value="" disabled>
              Selecione
            </option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Orçamento estimado" htmlFor="lead-budgetRange" error={err("budgetRange")} hint="Opcional">
          <Select id="lead-budgetRange" name="budgetRange" defaultValue="" {...aria("budgetRange")}>
            <option value="">Prefiro não informar</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Descreva o projeto" htmlFor="lead-description" required error={err("description")}>
        <Textarea
          id="lead-description"
          name="description"
          rows={5}
          maxLength={4000}
          required
          placeholder="Objetivo, público, funcionalidades desejadas, referências e prazo esperado."
          onChange={(e) => setDescLen(e.target.value.length)}
          {...aria("description")}
        />
        <p className="mt-1.5 text-right font-mono text-[10px] text-foreground-dim" aria-hidden="true">
          {descLen}/4000
        </p>
      </Field>

      {/* ids para aria-describedby dos campos com erro */}
      {(Object.keys(errors) as LeadField[]).map((k) => (
        <span key={k} id={`lead-${k}-error`} className="sr-only">
          {errors[k]}
        </span>
      ))}

      <div ref={statusRef} tabIndex={-1} id="lead-status" aria-live="polite" className="outline-none">
        {state && !state.ok && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
            {state.error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-foreground-dim">
          Usamos seus dados apenas para responder a esta solicitação.
        </p>
        <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
          {pending ? "Enviando…" : "Enviar solicitação"}
          {!pending && <ArrowRight strokeWidth={1.8} />}
        </Button>
      </div>
    </form>
  );
}

export function LeadForm() {
  const [key, setKey] = useState(0);
  return <LeadFormInner key={key} onReset={() => setKey((k) => k + 1)} />;
}
