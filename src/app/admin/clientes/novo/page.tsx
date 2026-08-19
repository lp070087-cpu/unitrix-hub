"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createClient } from "../actions";
import { toast } from "sonner";
import Link from "next/link";

const statusOptions = [
  { value: "LEAD", label: "Lead" },
  { value: "BRIEFING", label: "Briefing" },
  { value: "PROPOSAL_SENT", label: "Proposta Enviada" },
  { value: "NEGOTIATION", label: "Em Negociação" },
  { value: "CONTRACTED", label: "Contratado" },
  { value: "IN_PROGRESS", label: "Em Andamento" },
  { value: "COMPLETED", label: "Concluído" },
];

const projectTypes = [
  "Landing Page",
  "Site Institucional",
  "E-commerce",
  "Sistema Web",
  "SaaS",
  "Aplicativo Mobile",
  "ERP",
  "CRM",
  "Portal Corporativo",
  "IA Personalizada",
  "Projeto Personalizado",
];

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createClient(formData);
      toast.success("Cliente cadastrado com sucesso!");
      router.push("/admin/clientes");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/clientes"
            className="p-1.5 rounded-md hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-foreground">Novo Cliente</h2>
            <p className="text-xs text-foreground-muted">
              Cadastre um novo cliente na plataforma
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="card-premium p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Informações Básicas</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Nome *
                </label>
                <input
                  name="name"
                  required
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Empresa
                </label>
                <input
                  name="company"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  WhatsApp
                </label>
                <input
                  name="phone"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  CPF/CNPJ
                </label>
                <input
                  name="document"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Cidade
                </label>
                <input
                  name="city"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Senha (acesso do cliente)
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Endereço
                </label>
                <input
                  name="address"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Projeto */}
          <div className="card-premium p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Informações do Projeto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Tipo de Projeto
                </label>
                <select
                  name="projectType"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                >
                  <option value="">Selecionar...</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Segmento
                </label>
                <input
                  name="segment"
                  placeholder="Ex: Fintech, Saúde, Educação..."
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Orçamento (R$)
                </label>
                <input
                  name="budget"
                  type="number"
                  step="0.01"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground font-mono focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue="LEAD"
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-accent text-background font-bold text-sm px-6 py-2.5 rounded-md hover:bg-accent-hover transition-all disabled:opacity-50 hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Cliente
                </>
              )}
            </button>
            <Link
              href="/admin/clientes"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
