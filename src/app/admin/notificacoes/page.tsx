import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/states";
import { NotificationList } from "@/components/shared-notifications/notification-list";
import { serialize } from "@/lib/utils";

export const metadata = { title: "Notificações" };

export default async function AdminNotificationsPage() {
  const items = await prisma.notification.findMany({ where: { audience: "ADMIN" }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Notificações" description="Solicitações, assinaturas de contrato, briefings enviados e eventos financeiros." />
      <NotificationList items={serialize(items)} />
    </div>
  );
}
