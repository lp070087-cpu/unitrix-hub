import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export const CLIENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  LEAD: { label: "Lead", color: "text-zinc-400" },
  BRIEFING: { label: "Briefing", color: "text-blue-400" },
  PROPOSAL_SENT: { label: "Proposta Enviada", color: "text-yellow-400" },
  NEGOTIATION: { label: "Em Negociação", color: "text-orange-400" },
  CONTRACTED: { label: "Contratado", color: "text-emerald-400" },
  IN_PROGRESS: { label: "Em Andamento", color: "text-accent" },
  COMPLETED: { label: "Concluído", color: "text-green-400" },
  SUBSCRIBER: { label: "Assinante", color: "text-violet-400" },
  CANCELLED: { label: "Cancelado", color: "text-red-400" },
};

export const PROJECT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Planejamento", color: "text-blue-400" },
  IN_PROGRESS: { label: "Em Desenvolvimento", color: "text-accent" },
  REVIEW: { label: "Em Revisão", color: "text-yellow-400" },
  COMPLETED: { label: "Concluído", color: "text-green-400" },
  DELIVERED: { label: "Entregue", color: "text-emerald-400" },
};
