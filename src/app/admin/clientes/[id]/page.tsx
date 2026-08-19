import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { ClientDetailClient } from "./detail-client";

async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      presentations: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
      projects: {
        orderBy: { createdAt: "desc" },
        include: { milestones: { orderBy: { order: "asc" } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
      subscriptions: { include: { plan: true } },
    },
  });
  if (!client) return null;
  return JSON.parse(JSON.stringify(client));
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <AdminHeader title={client.name} />
      <ClientDetailClient client={client} />
    </>
  );
}
