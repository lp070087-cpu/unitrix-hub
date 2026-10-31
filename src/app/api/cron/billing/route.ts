import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { markOverdue } from "@/lib/billing/payments";
import { runBillingCycle } from "@/lib/billing/subscriptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(header: string | null, secret: string) {
  // Compara digests de tamanho fixo para não vazar tamanho nem conteúdo por timing.
  const a = createHash("sha256").update(header ?? "").digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET não configurado" }, { status: 503 });
  if (!authorized(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  }
  try {
    const overdue = await markOverdue();
    const cycle = await runBillingCycle();
    return NextResponse.json({ ok: true, ...cycle, markedOverdue: overdue.markedOverdue + cycle.markedOverdue });
  } catch (e) {
    console.error("[cron/billing]", (e as Error).message);
    return NextResponse.json({ ok: false, error: "Falha ao executar ciclo de cobrança" }, { status: 500 });
  }
}
