import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { FinanceiroClient } from "./financeiro-client";

async function getFinanceiro() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, name: true } }, project: { select: { title: true } } },
  });
  const totalPaid = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } });
  const totalPending = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } });
  return {
    payments: JSON.parse(JSON.stringify(payments)),
    totalPaid: totalPaid._sum.amount || 0,
    totalPending: totalPending._sum.amount || 0,
  };
}

export default async function FinanceiroPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const data = await getFinanceiro();
  return <><AdminHeader title="Financeiro" /><FinanceiroClient data={data} /></>;
}
