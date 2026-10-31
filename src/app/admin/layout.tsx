import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/layout/nav-config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/cliente");

  const [unread, newLeads] = await Promise.all([
    prisma.notification.count({ where: { audience: "ADMIN", read: false } }).catch(() => 0),
    prisma.lead.count({ where: { status: "NEW" } }).catch(() => 0),
  ]);

  return (
    <AdminShell user={{ name: session.user.name, email: session.user.email }} unread={unread} newLeads={newLeads}>
      {children}
    </AdminShell>
  );
}
