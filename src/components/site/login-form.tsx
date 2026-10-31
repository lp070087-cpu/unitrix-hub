"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

/** Aceita apenas caminhos internos ("/x", nunca "//x"). URLs absolutas do mesmo domínio
 *  (formato usado pelo middleware do NextAuth) são reduzidas ao caminho. */
function safeCallback(raw: string | null) {
  if (!raw) return null;
  let path = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (u.origin !== window.location.origin) return null;
      path = u.pathname + u.search + u.hash;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  if (path.startsWith("/auth/")) return null;
  return path;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        setError("E-mail ou senha incorretos. Verifique os dados e tente novamente.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = res.ok ? await res.json() : null;
      const role = session?.user?.role as string | undefined;
      const fallback = role === "ADMIN" ? "/admin" : "/cliente";
      const cb = safeCallback(params.get("callbackUrl"));
      // Cliente não deve ser enviado para a área administrativa.
      const target = cb && !(role !== "ADMIN" && cb.startsWith("/admin")) ? cb : fallback;
      router.replace(target);
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-describedby={error ? "login-error" : undefined}>
      <Field label="E-mail" htmlFor="login-email">
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@empresa.com"
          required
          className="h-11"
          aria-invalid={error ? true : undefined}
        />
      </Field>
      <Field label="Senha" htmlFor="login-password">
        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 pr-11"
            aria-invalid={error ? true : undefined}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-foreground-dim transition-colors hover:text-foreground"
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={show}
          >
            {show ? <EyeOff className="h-4 w-4" strokeWidth={1.6} /> : <Eye className="h-4 w-4" strokeWidth={1.6} />}
          </button>
        </div>
      </Field>

      <div aria-live="polite">
        {error && (
          <p id="login-error" role="alert" className="flex items-start gap-2 rounded-md border border-danger/25 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
