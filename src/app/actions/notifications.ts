"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { safe } from "@/lib/server/action";
import { AuthError } from "@/lib/server/session";

/** Escopo da notificação derivado da sessão — cliente só altera as próprias. */
async function scope() {
  const session = await auth();
  if (!session?.user) throw new AuthError("Não autenticado");
  return session.user.role === "ADMIN"
    ? { where: { audience: "ADMIN" }, path: "/admin" }
    : { where: { audience: "CLIENT", clientId: session.user.id }, path: "/cliente" };
}

export async function markNotificationRead(id: string) {
  return safe(async () => {
    const s = await scope();
    await prisma.notification.updateMany({ where: { ...s.where, id }, data: { read: true } });
    revalidatePath(s.path, "layout");
  });
}

export async function markAllNotificationsRead() {
  return safe(async () => {
    const s = await scope();
    await prisma.notification.updateMany({ where: { ...s.where, read: false }, data: { read: true } });
    revalidatePath(s.path, "layout");
  }, "Todas marcadas como lidas");
}
