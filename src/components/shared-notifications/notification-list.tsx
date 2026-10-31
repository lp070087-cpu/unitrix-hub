"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, CheckCheck, CircleDollarSign, FileSignature, FolderKanban, ClipboardList, Inbox, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { cn, formatDateTime } from "@/lib/utils";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications";

type N = { id: string; title: string; message: string; type: string; read: boolean; link: string | null; createdAt: string };
const icons: Record<string, any> = { PAYMENT: CircleDollarSign, CONTRACT: FileSignature, PROJECT: FolderKanban, BRIEFING: ClipboardList, LEAD: Inbox };

export function NotificationList({ items }: { items: N[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const unread = items.filter((i) => !i.read).length;

  function open(n: N) {
    start(async () => {
      if (!n.read) await markNotificationRead(n.id);
      if (n.link && n.link.startsWith("/")) router.push(n.link);
      else router.refresh();
    });
  }

  if (items.length === 0) return <Card><EmptyState icon={Bell} title="Tudo em dia" description="Você não possui notificações." /></Card>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-foreground-muted">{unread ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Todas lidas"}</p>
        {unread > 0 && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { await markAllNotificationsRead(); router.refresh(); })}>
            <CheckCheck /> Marcar todas como lidas
          </Button>
        )}
      </div>
      <Card className="divide-y divide-border overflow-hidden">
        {items.map((n) => {
          const Icon = icons[n.type] ?? Info;
          return (
            <button key={n.id} onClick={() => open(n)} className={cn("flex w-full items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-surface-hover/50 sm:px-5", !n.read && "bg-accent/[0.03]")}>
              <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border", n.read ? "text-foreground-dim" : "text-accent")}>
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={cn("text-sm", n.read ? "text-foreground-muted" : "font-medium text-foreground")}>{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Não lida" />}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-foreground-muted">{n.message}</span>
                <span className="mt-1.5 block text-xs text-foreground-dim">{formatDateTime(n.createdAt)}</span>
              </span>
            </button>
          );
        })}
      </Card>
    </div>
  );
}
