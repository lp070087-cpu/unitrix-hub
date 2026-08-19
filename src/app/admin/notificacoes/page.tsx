import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { Bell } from "lucide-react";

async function getNotifications() {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" }, take: 20,
    include: { client: { select: { name: true } } },
  });
}

export default async function NotificacoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const notifs = await getNotifications();

  return (
    <>
      <AdminHeader title="Notificações" />
      <div className="p-6 lg:p-8 space-y-4">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <Bell className="w-12 h-12 text-foreground-dim mb-4" />
            <p className="text-sm text-foreground-muted">Nenhuma notificação ainda.</p>
          </div>
        ) : (
          notifs.map((n: any) => (
            <div key={n.id} className="card-premium p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-xs text-foreground-muted">{n.message}</p>
                <p className="text-[10px] text-foreground-dim mt-1">
                  {n.client?.name} · {new Date(n.createdAt).toLocaleDateString("pt-BR")} às {new Date(n.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${n.read ? "bg-surface-hover text-foreground-dim" : "bg-accent/10 text-accent"}`}>
                {n.read ? "Lida" : "Nova"}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
