import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientShell } from "@/components/layout/nav-config";

export const dynamic = "force-dynamic";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/cliente");
  if (session.user.role === "ADMIN") redirect("/admin");

  const unread = await prisma.notification
    .count({ where: { clientId: session.user.id, audience: "CLIENT", read: false } })
    .catch(() => 0);

  return (
    <ClientShell user={{ name: session.user.name, email: session.user.email }} unread={unread}>
      {children}
    </ClientShell>
  );
}
