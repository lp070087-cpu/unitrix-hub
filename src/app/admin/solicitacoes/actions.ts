"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe } from "@/lib/server/action";

export async function updateLead(id: string, input: { status?: string; notes?: string }) {
  return safe(async () => {
    await requireAdmin();
    const data = z.object({
      status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "DISCARDED"]).optional(),
      notes: z.string().max(4000).optional(),
    }).parse(input);
    await prisma.lead.update({ where: { id }, data });
    revalidatePath("/admin/solicitacoes");
  }, "Solicitação atualizada");
}
