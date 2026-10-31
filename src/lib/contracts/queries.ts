import "server-only";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";

/** Clientes + projetos para formulários administrativos. */
export async function getClientOptions() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, company: true, projectType: true,
      projects: { orderBy: { createdAt: "desc" }, select: { id: true, title: true, totalValue: true, startDate: true, endDate: true } },
    },
  });
  return serialize(clients);
}
