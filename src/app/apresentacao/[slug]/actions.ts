"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { getRequestMeta } from "@/lib/server/request";
import { notifyAdmin } from "@/lib/server/notify";

const slugSchema = z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, "Link inválido");

/** Aprovação da proposta pelo cliente titular. Idempotente. */
export async function acceptPresentation(slug: string) {
  return safe(async () => {
    const { clientId, client } = await requireClient();
    const p = await prisma.presentation.findFirst({ where: { slug: slugSchema.parse(slug), clientId }, select: { id: true, title: true, status: true, acceptedAt: true } });
    if (!p) throw new UserError("Apresentação não encontrada");
    if (p.acceptedAt || p.status === "ACCEPTED") throw new UserError("Esta proposta já foi aprovada.");
    const { ip } = await getRequestMeta();
    const acceptedAt = new Date();
    const res = await prisma.presentation.updateMany({
      where: { id: p.id, clientId, acceptedAt: null, status: { in: ["SENT", "VIEWED"] } },
      data: { acceptedAt, acceptedByName: client.name, acceptedIp: ip, status: "ACCEPTED" },
    });
    if (res.count === 0) throw new UserError("Esta proposta não está disponível para aprovação.");
    await notifyAdmin("Proposta aprovada", `${client.name} aprovou a apresentação "${p.title}".`, { type: "SUCCESS", link: `/admin/apresentacoes/${p.id}`, clientId });
    revalidatePath(`/apresentacao/${slug}`);
    revalidatePath("/cliente/apresentacoes");
    revalidatePath("/admin/apresentacoes");
    revalidatePath(`/admin/apresentacoes/${p.id}`);
    return { acceptedAt: acceptedAt.toISOString() };
  }, "Proposta aprovada. A equipe Unitrix foi notificada.");
}
