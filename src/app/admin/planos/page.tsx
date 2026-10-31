import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { PageHeader } from "@/components/ui/states";
import { serialize } from "@/lib/utils";
import { PlansClient, PlanDialog } from "./plans-client";

export const dynamic = "force-dynamic";

export default async function PlanosPage() {
  await requireAdmin();
  const plans = await prisma.plan.findMany({
    orderBy: [{ active: "desc" }, { category: "asc" }, { price: "asc" }],
    include: { _count: { select: { subscriptions: true } }, subscriptions: { where: { status: { in: ["ACTIVE", "PAST_DUE"] } }, select: { id: true } } },
  });
  const rows = plans.map(({ subscriptions, ...p }) => ({ ...p, activeSubscriptions: subscriptions.length }));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Receita" title="Planos" description="Serviços recorrentes: hospedagem, suporte, manutenção e evolução." actions={<PlanDialog />} />
      <PlansClient plans={serialize(rows)} />
    </div>
  );
}
