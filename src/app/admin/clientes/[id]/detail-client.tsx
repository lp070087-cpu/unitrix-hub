"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  DollarSign,
  Pencil,
  Trash2,
  FolderKanban,
  Presentation,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate, CLIENT_STATUS_MAP, PROJECT_STATUS_MAP } from "@/lib/utils";
import { deleteClient } from "../actions";

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={`card-premium p-5 ${className}`}
    >
      <h3 className="text-sm font-bold text-foreground mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

export function ClientDetailClient({ client }: { client: any }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Tem certeza que deseja excluir este cliente? Esta ação é irreversível.")) return;
    setDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success("Cliente excluído.");
      router.push("/admin/clientes");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  }

  const statusConfig = CLIENT_STATUS_MAP[client.status] || { label: client.status, color: "text-zinc-400" };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/clientes" className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para clientes
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/clientes/${client.id}/editar`}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover transition-all"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md border border-red-400/20 hover:bg-red-400/5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar info */}
        <div className="space-y-6">
          <Section title="Perfil">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className={`text-xs font-semibold ${statusConfig.color} px-2 py-0.5 rounded-full bg-surface-hover`}>
                  {statusConfig.label}
                </span>
              </div>
              {client.company && (
                <p className="text-xs text-foreground-muted flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> {client.company}
                </p>
              )}
              <p className="text-xs text-foreground-muted flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {client.email}
              </p>
              {client.phone && (
                <p className="text-xs text-foreground-muted flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> {client.phone}
                </p>
              )}
              {client.city && (
                <p className="text-xs text-foreground-muted flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {client.city}
                </p>
              )}
              {client.document && (
                <p className="text-xs text-foreground-dim mt-1">CPF/CNPJ: {client.document}</p>
              )}
              {client.segment && (
                <p className="text-xs text-foreground-dim">Segmento: {client.segment}</p>
              )}
              {client.projectType && (
                <p className="text-xs text-foreground-dim">Tipo: {client.projectType}</p>
              )}
              {client.budget && (
                <p className="text-xs text-accent font-mono font-semibold mt-1">
                  Orçamento: {formatCurrency(Number(client.budget))}
                </p>
              )}
            </div>
          </Section>

          {/* Quick links */}
          <Section title="Ações Rápidas">
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-surface-hover transition-colors text-sm text-foreground-muted hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </Link>
              ))}
            </div>
          </Section>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projetos */}
          <Section title="Projetos">
            {client.projects.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">Nenhum projeto vinculado.</p>
            ) : (
              <div className="space-y-3">
                {client.projects.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{p.title}</p>
                      <p className="text-xs text-foreground-muted">
                        {p.milestones?.length || 0} etapas &middot; Progresso: {p.progress}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-foreground-muted">
                        {PROJECT_STATUS_MAP[p.status]?.label || p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Apresentações */}
          <Section title="Apresentações">
            {client.presentations.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">Nenhuma apresentação enviada.</p>
            ) : (
              <div className="space-y-3">
                {client.presentations.map((pres: any) => (
                  <div key={pres.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <Presentation className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-semibold">{pres.title}</p>
                        <p className="text-xs text-foreground-muted">
                          Status: {pres.status} &middot; {formatDate(pres.createdAt)}
                        </p>
                      </div>
                    </div>
                    {pres.status === "SENT" && !pres.viewedAt && (
                      <span className="text-xs text-yellow-400 font-semibold">Aguardando visualização</span>
                    )}
                    {pres.viewedAt && (
                      <span className="text-xs text-green-400 font-semibold">Visualizada em {formatDate(pres.viewedAt)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Contratos */}
          <Section title="Contratos">
            {client.contracts.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">Nenhum contrato gerado.</p>
            ) : (
              <div className="space-y-3">
                {client.contracts.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-foreground-muted">
                          {formatCurrency(Number(c.value))} &middot; Status: {c.status}
                        </p>
                      </div>
                    </div>
                    {c.signedAt ? (
                      <span className="text-xs text-green-400 font-semibold">Assinado em {formatDate(c.signedAt)}</span>
                    ) : (
                      <span className="text-xs text-yellow-400 font-semibold">Pendente</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Pagamentos */}
          <Section title="Pagamentos">
            {client.payments.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">Nenhum pagamento registrado.</p>
            ) : (
              <div className="space-y-2">
                {client.payments.map((pay: any) => (
                  <div key={pay.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{pay.description}</p>
                      <p className="text-xs text-foreground-muted">{pay.type === "DEPOSIT" ? "Entrada" : pay.type === "FINAL_BALANCE" ? "Saldo Final" : "Mensalidade"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">{formatCurrency(Number(pay.amount))}</p>
                      <p className={`text-xs font-semibold ${pay.status === "PAID" ? "text-green-400" : pay.status === "OVERDUE" ? "text-red-400" : "text-yellow-400"}`}>
                        {pay.status === "PAID" ? "Pago" : pay.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

const quickActions = [
  { href: "#", label: "Criar Apresentação", icon: Presentation },
  { href: "#", label: "Gerar Contrato", icon: FileText },
  { href: "#", label: "Registrar Pagamento", icon: DollarSign },
  { href: "#", label: "Criar Projeto", icon: FolderKanban },
  { href: "#", label: "Gerenciar Assinatura", icon: CreditCard },
];
