import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";

export default async function ClienteNotificacoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const client = await prisma.client.findUnique({
    where: { email: session.user.email! },
    include: { notifications: { orderBy: { createdAt: "desc" } } },
  });

  if (!client) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground-muted">Cliente não encontrado.</p></div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Notificações</h1>
        <p className="text-xs text-foreground-muted mt-1">{client.notifications.filter((n: any) => !n.read).length} não lidas</p>
      </div>

      {client.notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Bell className="w-10 h-10 text-foreground-dim mb-4" />
          <p className="text-sm text-foreground-muted">Nenhuma notificação.</p>
          <p className="text-xs text-foreground-dim mt-1">Você será notificado sobre atualizações dos seus projetos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {client.notifications.map((n: any) => (
            <div key={n.id} className={`card-premium p-4 flex items-start justify-between gap-4 ${!n.read ? "border-l-2 border-l-accent" : ""}`}>
              <div>
                <p className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-foreground-muted"}`}>{n.title}</p>
                <p className="text-xs text-foreground-muted mt-1">{n.message}</p>
                <p className="text-[10px] text-foreground-dim mt-2">
                  {new Date(n.createdAt).toLocaleDateString("pt-BR")} às {new Date(n.createdAt).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}
                </p>
              </div>
              {!n.read && <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full flex-shrink-0">Nova</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
