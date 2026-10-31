import { Badge, type Tone } from "@/components/ui/badge";

type Map = Record<string, { label: string; tone: Tone }>;

export function StatusBadge({ map, status, dot = true, className }: { map: Map; status: string; dot?: boolean; className?: string }) {
  const s = map[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={s.tone} dot={dot} className={className}>{s.label}</Badge>;
}

/** Status de entrega como o cliente vê (sem expor estados internos como "pronta"). */
export const CLIENT_DELIVERY_MAP: Map = {
  PENDING: { label: "Aguardando liberação", tone: "neutral" },
  RELEASED: { label: "Liberada", tone: "success" },
};
