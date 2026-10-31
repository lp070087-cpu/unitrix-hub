import "server-only";
import { prisma } from "@/lib/prisma";

type Kind = "INFO" | "SUCCESS" | "WARNING" | "PAYMENT" | "CONTRACT" | "PROJECT" | "BRIEFING" | "LEAD";

/** Notificação para o portal do cliente. Falhas não interrompem o fluxo principal. */
export async function notifyClient(clientId: string, title: string, message: string, opts: { type?: Kind; link?: string } = {}) {
  try {
    await prisma.notification.create({ data: { clientId, title, message, type: opts.type ?? "INFO", link: opts.link, audience: "CLIENT" } });
  } catch (e) {
    console.error("[notify] falha ao criar notificação do cliente", (e as Error).message);
  }
}

/** Notificação para a equipe administrativa. */
export async function notifyAdmin(title: string, message: string, opts: { type?: Kind; link?: string; clientId?: string } = {}) {
  try {
    await prisma.notification.create({ data: { title, message, type: opts.type ?? "INFO", link: opts.link, audience: "ADMIN", clientId: opts.clientId } });
  } catch (e) {
    console.error("[notify] falha ao criar notificação admin", (e as Error).message);
  }
}
