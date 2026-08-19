import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { DashboardClient } from "./dashboard-client";

async function getStats() {
  try {
    const [totalClients, activeProjects, monthlyRevenue, pendingPayments] =
      await Promise.all([
        prisma.client.count(),
        prisma.project.count({ where: { status: { in: ["IN_PROGRESS", "REVIEW"] } } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } }),
      ]);

    const recentClients = await prisma.client.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      select: { id: true, name: true, company: true, status: true, createdAt: true },
    });

    const recentPayments = await prisma.payment.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } } },
    });

    const activeProjectsList = await prisma.project.findMany({
      where: { status: { in: ["IN_PROGRESS", "REVIEW", "PLANNING"] } },
      orderBy: { endDate: "asc" }, take: 4,
      include: { client: { select: { name: true } } },
    });

    return {
      totalClients, activeProjects,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingPayments: pendingPayments._sum.amount || 0,
      recentClients, recentPayments, activeProjectsList,
    };
  } catch {
    return {
      totalClients: 0, activeProjects: 0, monthlyRevenue: 0, pendingPayments: 0,
      recentClients: [], recentPayments: [], activeProjectsList: [],
    };
  }
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const stats = await getStats();

  return (
    <>
      <AdminHeader title="Dashboard" />
      <DashboardClient stats={stats} />
    </>
  );
}
