import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { PageHeader } from "@/components/ui/states";
import { NotificationList } from "@/components/shared-notifications/notification-list";
import { serialize } from "@/lib/utils";

export const metadata = { title: "Notificações" };

export default async function ClientNotificationsPage() {
  const { clientId } = await requireClient();
  const items = await prisma.notification.findMany({ where: { clientId, audience: "CLIENT" }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Notificações" description="Atualizações do seu projeto, documentos e pagamentos." />
      <NotificationList items={serialize(items)} />
    </div>
  );
}
