import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjetosClienteClient } from "./projetos-cliente";

export default async function ClienteProjetosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const client = await prisma.client.findUnique({
    where: { email: session.user.email! },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: { milestones: { orderBy: { order: "asc" } }, payments: true },
      },
    },
  });

  if (!client) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground-muted">Cliente não encontrado.</p></div>;
  }

  return <ProjetosClienteClient client={client} />;
}
