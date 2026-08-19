"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Presentation,
  FileText,
  FolderKanban,
  DollarSign,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLIENT_LINKS = [
  { href: "/cliente", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cliente/apresentacoes", label: "Apresentações", icon: Presentation },
  { href: "/cliente/contratos", label: "Contratos", icon: FileText },
  { href: "/cliente/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/cliente/pagamentos", label: "Pagamentos", icon: DollarSign },
  { href: "/cliente/notificacoes", label: "Notificações", icon: Bell },
];

function ClientSidebarLink({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon: any;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/cliente" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 group relative",
        isActive
          ? "bg-accent/10 text-accent font-semibold"
          : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
      )}
    >
      <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-accent")} />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {isActive && !collapsed && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-full" />
      )}
    </Link>
  );
}

export function ClientSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col z-30 overflow-hidden"
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-14 px-4 border-b border-border", collapsed ? "justify-center" : "gap-2")}>
        <div className="w-6 h-6 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <line x1="32" y1="100" x2="168" y2="100" stroke="#B8FF2E" strokeWidth="4" strokeLinecap="round" />
            <line x1="46.5" y1="150" x2="153.5" y2="50" stroke="#B8FF2E" strokeWidth="4" strokeLinecap="round" />
            <line x1="46.5" y1="50" x2="153.5" y2="150" stroke="#B8FF2E" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill="#B8FF2E" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-black text-sm tracking-tight">
            Unitri<span className="text-accent">x</span>
          </span>
        )}
      </div>

      {/* Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {CLIENT_LINKS.map((link) => (
          <ClientSidebarLink key={link.href} {...link} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-red-400 hover:bg-surface-hover transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-foreground-muted" /> : <ChevronLeft className="w-3 h-3 text-foreground-muted" />}
      </button>
    </motion.aside>
  );
}
