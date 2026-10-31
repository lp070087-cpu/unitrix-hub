import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Tone } from "@/components/ui/badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumber(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v as any);
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(toNumber(value));
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", opts ?? { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(date));
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export function slugify(input: string): string {
  return input
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
}

/** Serializa objetos Prisma (Decimal/Date) para Client Components. */
export function serialize<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

type StatusMap = Record<string, { label: string; tone: Tone; color: string }>;
const toneColor: Record<Tone, string> = {
  neutral: "text-foreground-muted", accent: "text-accent", success: "text-success",
  warning: "text-warning", danger: "text-danger", info: "text-info",
};
function map(entries: Record<string, [string, Tone]>): StatusMap {
  return Object.fromEntries(Object.entries(entries).map(([k, [label, tone]]) => [k, { label, tone, color: toneColor[tone] }]));
}

export const CLIENT_STATUS_MAP = map({
  LEAD: ["Lead", "neutral"], BRIEFING: ["Briefing", "info"], PROPOSAL_SENT: ["Proposta enviada", "warning"],
  NEGOTIATION: ["Em negociação", "warning"], CONTRACTED: ["Contratado", "success"], IN_PROGRESS: ["Em andamento", "accent"],
  COMPLETED: ["Concluído", "success"], SUBSCRIBER: ["Assinante", "info"], CANCELLED: ["Cancelado", "danger"],
});

export const PROJECT_STATUS_MAP = map({
  PLANNING: ["Planejamento", "info"], IN_PROGRESS: ["Em desenvolvimento", "accent"], REVIEW: ["Em validação", "warning"],
  COMPLETED: ["Concluído", "success"], DELIVERED: ["Entregue", "success"], PAUSED: ["Pausado", "neutral"], CANCELLED: ["Cancelado", "danger"],
});
export const PROJECT_PIPELINE = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "DELIVERED"] as const;

export const MILESTONE_STATUS_MAP = map({
  PENDING: ["Pendente", "neutral"], IN_PROGRESS: ["Em andamento", "accent"], COMPLETED: ["Concluída", "success"],
});

export const CONTRACT_STATUS_MAP = map({
  DRAFT: ["Rascunho", "neutral"], SENT: ["Enviado", "info"], VIEWED: ["Visualizado", "warning"],
  SIGNED: ["Assinado", "success"], SUPERSEDED: ["Substituído", "neutral"], CANCELLED: ["Cancelado", "danger"],
});

export const PRESENTATION_STATUS_MAP = map({
  DRAFT: ["Rascunho", "neutral"], SENT: ["Enviada", "info"], VIEWED: ["Visualizada", "warning"],
  ACCEPTED: ["Aprovada", "success"], ARCHIVED: ["Arquivada", "neutral"],
});

export const BRIEFING_STATUS_MAP = map({
  DRAFT: ["Rascunho", "neutral"], SUBMITTED: ["Enviado", "info"], REVISION_REQUESTED: ["Ajustes solicitados", "warning"],
  APPROVED: ["Aprovado", "success"],
});

export const PAYMENT_STATUS_MAP = map({
  PENDING: ["Pendente", "warning"], PAID: ["Pago", "success"], OVERDUE: ["Atrasado", "danger"], CANCELLED: ["Cancelado", "neutral"],
});
export const PAYMENT_TYPE_MAP: Record<string, string> = {
  DEPOSIT: "Entrada 50%", FINAL_BALANCE: "Saldo 50%", SUBSCRIPTION: "Mensalidade", EXTRA: "Avulso",
};

export const SUBSCRIPTION_STATUS_MAP = map({
  ACTIVE: ["Ativa", "success"], PAUSED: ["Pausada", "warning"], PAST_DUE: ["Em atraso", "danger"], CANCELED: ["Cancelada", "neutral"],
});

export const PLAN_INTERVAL_MAP: Record<string, string> = { MONTHLY: "Mensal", QUARTERLY: "Trimestral", YEARLY: "Anual" };
export const PLAN_CATEGORY_MAP: Record<string, string> = { HOSTING: "Hospedagem", SUPPORT: "Suporte", MAINTENANCE: "Manutenção", SERVICE: "Serviço" };

export const DELIVERY_STATUS_MAP = map({
  BLOCKED: ["Bloqueada", "danger"], READY: ["Pronta para liberação", "warning"], RELEASED: ["Liberada", "success"],
});

export const LEAD_STATUS_MAP = map({
  NEW: ["Novo", "accent"], CONTACTED: ["Contatado", "info"], QUALIFIED: ["Qualificado", "warning"],
  CONVERTED: ["Convertido", "success"], DISCARDED: ["Descartado", "neutral"],
});

export const PROJECT_TYPES = [
  "Website profissional", "Landing page", "E-commerce", "Sistema personalizado", "SaaS / Plataforma",
  "Aplicativo / PWA", "Automação / IA", "Integrações / Infraestrutura", "Outro",
];

export const BUDGET_RANGES = ["Até R$ 5 mil", "R$ 5 mil – 15 mil", "R$ 15 mil – 40 mil", "R$ 40 mil – 100 mil", "Acima de R$ 100 mil", "Ainda não sei"];
