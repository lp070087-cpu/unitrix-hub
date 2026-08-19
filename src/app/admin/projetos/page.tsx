import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { ProjetosClient } from "./projetos-client";

async function getProjetos() {
  const projetos = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      milestones: { orderBy: { order: "asc" } },
      payments: true,
    },
  });
  return JSON.parse(JSON.stringify(projetos));
}

async function getClients() {
  return prisma.client.findMany({ select: { id: true, name: true, company: true }, orderBy: { name: "asc" } });
}

export default async function ProjetosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const [projetos, clients] = await Promise.all([getProjetos(), getClients()]);
  return <><AdminHeader title="Projetos" /><ProjetosClient projetos={projetos} clients={clients} /></>;
}
