"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };
export type NavGroup = { title?: string; items: NavItem[] };

function NavLink({ item, root, onNavigate }: { item: NavItem; root: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.href !== root && pathname.startsWith(item.href + "/")) || (item.href !== root && pathname === item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 h-9 text-[13.5px] transition-colors",
        active ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground hover:bg-surface-hover/60"
      )}
    >
      <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "text-accent" : "text-foreground-dim group-hover:text-foreground-muted")} strokeWidth={1.6} />
      <span className="truncate">{item.label}</span>
      {!!item.badge && (
        <span className="ml-auto rounded-full bg-accent/15 px-1.5 text-[10.5px] font-medium text-accent num">{item.badge}</span>
      )}
    </Link>
  );
}

function SidebarContent({ groups, root, user, label, onNavigate }: { groups: NavGroup[]; root: string; user: { name?: string | null; email?: string | null }; label: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <Link href={root} onClick={onNavigate}><Logo suffix={label} /></Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6" aria-label="Navegação principal">
        {groups.map((g, i) => (
          <div key={i}>
            {g.title && <p className="eyebrow px-2.5 mb-2">{g.title}</p>}
            <div className="space-y-0.5">
              {g.items.map((it) => <NavLink key={it.href} item={it} root={root} onNavigate={onNavigate} />)}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-deep/40 text-[12px] font-semibold text-foreground">
            {(user.name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">{user.name || "Usuário"}</p>
            <p className="truncate text-[11.5px] text-foreground-dim">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="rounded-md p-2 text-foreground-dim hover:bg-surface-hover hover:text-foreground"
            aria-label="Sair" title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ groups, root, label, user, notificationsHref, unread = 0, children }: {
  groups: NavGroup[]; root: string; label: string; user: { name?: string | null; email?: string | null };
  notificationsHref: string; unread?: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-border bg-surface-sunken lg:block">
        <SidebarContent groups={groups} root={root} user={user} label={label} />
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div className={cn("absolute inset-0 bg-black/60 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <aside className={cn("absolute inset-y-0 left-0 w-[86%] max-w-[300px] border-r border-border bg-surface-sunken transition-transform duration-300 ease-out", open ? "translate-x-0" : "-translate-x-full")}>
          <button className="absolute right-3 top-4 rounded-md p-2 text-foreground-muted hover:bg-surface-hover" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
          <SidebarContent groups={groups} root={root} user={user} label={label} onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button className="-ml-1.5 rounded-md p-2 text-foreground-muted hover:bg-surface-hover lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden"><Logo /></div>
          <div className="ml-auto flex items-center gap-1">
            <Link href={notificationsHref} className="relative rounded-md p-2 text-foreground-muted hover:bg-surface-hover hover:text-foreground" aria-label={`Notificações${unread ? ` (${unread} não lidas)` : ""}`}>
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />}
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
