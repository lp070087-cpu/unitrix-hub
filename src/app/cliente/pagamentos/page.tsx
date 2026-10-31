import Link from "next/link";
import { redirect } from "next/navigation";
import { Info, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader, Stat } from "@/components/ui/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDay } from "@/lib/billing/format";
import { formatCurrency, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientePagamentosPage() {
  const { clientId } = await requireClient().catch(() => redirect("/auth/login?callbackUrl=/cliente/pagamentos"));
  const payments = await prisma.payment.findMany({
    where: { clientId, subscriptionId: null, status: { not: "CANCELLED" } },
    orderBy: [{ createdAt: "desc" }],
    select: { id: true, description: true, type: true, amount: true, status: true, dueDate: true, paidAt: true, project: { select: { id: true, title: true } } },
  });

  const sum = (s: string[]) => payments.filter((p) => s.includes(p.status)).reduce((t, p) => t + toNumber(p.amount), 0);
  const paid = sum(["PAID"]);
  const pending = sum(["PENDING"]);
  const overdue = sum(["OVERDUE"]);
  const open = payments.filter((p) => p.status === "PENDING" || p.status === "OVERDUE");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financeiro" title="Pagamentos" description="Cobranças dos seus projetos: entrada, saldo e serviços avulsos." actions={<Link href="/cliente/mensalidades" className="text-[13px] text-foreground-muted hover:text-foreground">Mensalidades →</Link>} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Pago" value={<span className="text-success">{formatCurrency(paid)}</span>} />
        <Stat label="Pendente" value={formatCurrency(pending)} />
        <Stat label="Em atraso" value={<span className={overdue > 0 ? "text-danger" : undefined}>{formatCurrency(overdue)}</span>} />
      </div>

      {open.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
          <p className="text-[13px] leading-relaxed text-foreground-muted">
            A Unitrix enviará os dados de pagamento (Pix, boleto ou transferência) pelos canais combinados. Após o recebimento, a confirmação aparece aqui automaticamente.
          </p>
        </div>
      )}

      <Card>
        <CardHeader title="Histórico" description={`${payments.length} ${payments.length === 1 ? "cobrança" : "cobranças"}`} />
        {payments.length === 0 ? (
          <EmptyState icon={Receipt} title="Nenhuma cobrança" description="As cobranças dos seus projetos aparecem aqui." className="border-t border-border" />
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{p.description}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {PAYMENT_TYPE_MAP[p.type] ?? p.type}
                    {p.project && <> · <Link href={`/cliente/projetos/${p.project.id}`} className="hover:text-foreground">{p.project.title}</Link></>}
                  </p>
                  <p className="num mt-1 text-2xs text-foreground-dim">{p.status === "PAID" ? `Pago em ${formatDay(p.paidAt)}` : p.dueDate ? `Vencimento ${formatDay(p.dueDate)}` : "Vencimento a definir"}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="num text-sm text-foreground">{formatCurrency(p.amount)}</span>
                  <StatusBadge map={PAYMENT_STATUS_MAP} status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
