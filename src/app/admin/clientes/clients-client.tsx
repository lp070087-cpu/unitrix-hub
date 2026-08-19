"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Plus, Search, Mail, Phone, Building2, ArrowUpRight } from "lucide-react";
import { formatCurrency, CLIENT_STATUS_MAP } from "@/lib/utils";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  status: string;
  budget: string | null;
  projectType: string | null;
  createdAt: string;
  _count: { projects: number; contracts: number };
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const card: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

function ClientCard({ client }: { client: Client }) {
  const statusConfig = CLIENT_STATUS_MAP[client.status] || {
    label: client.status,
    color: "text-zinc-400",
  };

  return (
    <motion.div variants={card} className="card-premium p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            {client.name}
          </h3>
          {client.company && (
            <p className="text-xs text-foreground-muted flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" /> {client.company}
            </p>
          )}
        </div>
        <span className={`text-[11px] font-semibold ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        <p className="text-xs text-foreground-muted flex items-center gap-1.5">
          <Mail className="w-3 h-3" /> {client.email}
        </p>
        {client.phone && (
          <p className="text-xs text-foreground-muted flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> {client.phone}
          </p>
        )}
        {client.projectType && (
          <p className="text-xs text-foreground-dim mt-1">{client.projectType}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-3 text-xs text-foreground-muted">
          <span>{client._count.projects} projetos</span>
          <span>{client._count.contracts} contratos</span>
          {client.budget && (
            <span className="font-mono text-accent">{formatCurrency(Number(client.budget))}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/admin/clientes/${client.id}`}
            className="p-1.5 rounded-md hover:bg-surface-hover transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-foreground-muted" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function ClientsClient({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-md py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-dim/50 focus:outline-none focus:border-accent/40 transition-all"
          />
        </div>
        <Link
          href="/admin/clientes/novo"
          className="flex items-center gap-2 bg-accent text-background font-bold text-sm px-4 py-2 rounded-md hover:bg-accent-hover transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(184,255,46,0.2)]"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </Link>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-foreground-muted">
        <span className="font-semibold text-foreground">{clients.length}</span> clientes no total
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground-muted text-sm">Nenhum cliente encontrado.</p>
          <Link
            href="/admin/clientes/novo"
            className="inline-flex items-center gap-2 text-accent text-sm mt-2 hover:underline"
          >
            <Plus className="w-4 h-4" /> Cadastrar primeiro cliente
          </Link>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
