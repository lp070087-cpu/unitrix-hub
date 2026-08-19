import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientDashboardClient } from "./dashboard-client";

async function getClientData(email: string) {
  const client = await prisma.client.findUnique({
    where: { email },
    include: {
      projects: { include: { milestones: { orderBy: { order: "asc" } } }, orderBy: { createdAt: "desc" }, take: 1 },
      contracts: { orderBy: { createdAt: "desc" }, take: 3 },
      payments: { orderBy: { createdAt: "desc" }, take: 5 },
      presentations: { where: { status: "SENT" }, orderBy: { createdAt: "desc" }, take: 3 },
      notifications: { where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  return client ? JSON.parse(JSON.stringify(client)) : null;
}

export default async function ClientePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const client = await getClientData(session.user.email!);
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-foreground-muted">Cliente não encontrado.</p>
      </div>
    );
  }

  return <ClientDashboardClient client={client} />;
}
