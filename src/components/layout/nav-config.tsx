"use client";

import {
  LayoutDashboard, Users, Inbox, FolderKanban, ClipboardList, FileSignature, Presentation,
  Wallet, Package, Repeat, Bell, CreditCard,
} from "lucide-react";
import { AppShell, type NavGroup } from "./app-shell";

export function AdminShell({ children, user, unread, newLeads }: { children: React.ReactNode; user: { name?: string | null; email?: string | null }; unread: number; newLeads: number }) {
  const groups: NavGroup[] = [
    { items: [
      { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
      { href: "/admin/solicitacoes", label: "Solicitações", icon: Inbox, badge: newLeads },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
    ] },
    { title: "Operação", items: [
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/admin/briefings", label: "Briefings", icon: ClipboardList },
      { href: "/admin/apresentacoes", label: "Apresentações", icon: Presentation },
      { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
    ] },
    { title: "Receita", items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
      { href: "/admin/planos", label: "Planos", icon: Package },
      { href: "/admin/assinaturas", label: "Assinaturas", icon: Repeat },
    ] },
    { items: [{ href: "/admin/notificacoes", label: "Notificações", icon: Bell, badge: unread }] },
  ];
  return <AppShell groups={groups} root="/admin" label="Hub" user={user} notificationsHref="/admin/notificacoes" unread={unread}>{children}</AppShell>;
}

export function ClientShell({ children, user, unread }: { children: React.ReactNode; user: { name?: string | null; email?: string | null }; unread: number }) {
  const groups: NavGroup[] = [
    { items: [
      { href: "/cliente", label: "Início", icon: LayoutDashboard },
      { href: "/cliente/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/cliente/briefing", label: "Briefing", icon: ClipboardList },
    ] },
    { title: "Documentos", items: [
      { href: "/cliente/apresentacoes", label: "Apresentações", icon: Presentation },
      { href: "/cliente/contratos", label: "Contratos", icon: FileSignature },
    ] },
    { title: "Financeiro", items: [
      { href: "/cliente/pagamentos", label: "Pagamentos", icon: Wallet },
      { href: "/cliente/mensalidades", label: "Mensalidades", icon: CreditCard },
    ] },
    { items: [{ href: "/cliente/notificacoes", label: "Notificações", icon: Bell, badge: unread }] },
  ];
  return <AppShell groups={groups} root="/cliente" label="Portal" user={user} notificationsHref="/cliente/notificacoes" unread={unread}>{children}</AppShell>;
}
