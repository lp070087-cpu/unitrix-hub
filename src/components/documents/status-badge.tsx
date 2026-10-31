import { Badge } from "@/components/ui/badge";
import { BRIEFING_STATUS_MAP, CONTRACT_STATUS_MAP, PRESENTATION_STATUS_MAP } from "@/lib/utils";

const maps = { contract: CONTRACT_STATUS_MAP, presentation: PRESENTATION_STATUS_MAP, briefing: BRIEFING_STATUS_MAP } as const;

export function DocStatusBadge({ kind, status, className }: { kind: keyof typeof maps; status: string; className?: string }) {
  const s = maps[kind][status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={s.tone} dot className={className}>{s.label}</Badge>;
}
