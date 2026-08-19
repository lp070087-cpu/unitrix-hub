"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function UnitrixWordmark() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-black tracking-tight text-white">
        Unitri<span className="text-accent">x</span> <span className="text-foreground-dim font-semibold text-2xl">Hub</span>
      </h1>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    // Fetch session to determine role
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    router.push(role === "ADMIN" ? "/admin" : "/cliente");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/3 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(60deg, #B8FF2E 0px, #B8FF2E 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-60deg, #B8FF2E 0px, #B8FF2E 1px, transparent 1px, transparent 20px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm mx-auto px-6"
      >
        <div className="mb-10">
          <UnitrixWordmark />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider text-foreground-muted uppercase">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-surface border border-border rounded-md py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-dim/50 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider text-foreground-muted uppercase">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-border rounded-md py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-dim/50 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 bg-accent text-background font-bold text-sm py-3 rounded-md transition-all duration-200",
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(184,255,46,0.2)]"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-foreground-dim mt-8">
          Unitrix Hub &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
