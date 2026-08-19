import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { ClientsClient } from "./clients-client";

async function getClients() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      status: true,
      budget: true,
      projectType: true,
      createdAt: true,
      _count: { select: { projects: true, contracts: true } },
    },
  });
  return JSON.parse(JSON.stringify(clients));
}

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const clients = await getClients();

  return (
    <>
      <AdminHeader title="Clientes" />
      <ClientsClient clients={clients} />
    </>
  );
}
