"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { notifyClient } from "@/lib/server/notify";

const id = z.string().min(1).max(64);

function revalidate(bid?: string) {
  revalidatePath("/admin/briefings");
  revalidatePath("/cliente/briefing");
  if (bid) {
    revalidatePath(`/admin/briefings/${bid}`);
    revalidatePath(`/cliente/briefing/${bid}`);
  }
}

async function assertProjectAvailable(projectId: string, clientId: string, briefingId?: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, clientId }, select: { id: true, briefing: { select: { id: true } } } });
  if (!project) throw new UserError("Projeto não pertence a este cliente");
  if (project.briefing && project.briefing.id !== briefingId) throw new UserError("Este projeto já possui outro briefing vinculado");
}

const createSchema = z.object({
  clientId: z.string().min(1, "Selecione o cliente"),
  projectId: z.string().optional().transform((v) => v || null),
  title: z.string().trim().min(3, "Informe um título").max(160),
});

export async function createBriefingForClient(input: z.input<typeof createSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = createSchema.parse(input);
    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true, company: true } });
    if (!client) throw new UserError("Cliente não encontrado");
    if (data.projectId) await assertProjectAvailable(data.projectId, client.id);
    const b = await prisma.briefing.create({
      data: { title: data.title, status: "DRAFT", clientId: client.id, projectId: data.projectId, companyName: client.company },
      select: { id: true },
    });
    await notifyClient(client.id, "Briefing aguardando preenchimento", `A Unitrix criou o briefing "${data.title}" para você preencher.`, { type: "BRIEFING", link: `/cliente/briefing/${b.id}` });
    revalidate(b.id);
    return { id: b.id };
  }, "Briefing criado e cliente notificado");
}

export async function approveBriefing(briefingId: string) {
  return safe(async () => {
    await requireAdmin();
    const bid = id.parse(briefingId);
    const b = await prisma.briefing.findUnique({ where: { id: bid }, select: { id: true, clientId: true, title: true } });
    if (!b) throw new UserError("Briefing não encontrado");
    const res = await prisma.briefing.updateMany({ where: { id: bid, status: "SUBMITTED" }, data: { status: "APPROVED", reviewedAt: new Date() } });
    if (res.count === 0) throw new UserError("Apenas briefings enviados podem ser aprovados");
    await notifyClient(b.clientId, "Briefing aprovado", `Seu briefing "${b.title}" foi aprovado pela equipe Unitrix.`, { type: "BRIEFING", link: `/cliente/briefing/${bid}` });
    revalidate(bid);
    return { id: bid };
  }, "Briefing aprovado");
}

const revisionSchema = z.object({ note: z.string().trim().min(5, "Descreva os ajustes necessários").max(4000) });

export async function requestBriefingRevision(briefingId: string, note: string) {
  return safe(async () => {
    await requireAdmin();
    const bid = id.parse(briefingId);
    const data = revisionSchema.parse({ note });
    const b = await prisma.briefing.findUnique({ where: { id: bid }, select: { id: true, clientId: true, title: true } });
    if (!b) throw new UserError("Briefing não encontrado");
    const now = new Date();
    const res = await prisma.briefing.updateMany({
      where: { id: bid, status: { in: ["SUBMITTED", "APPROVED"] } },
      data: { status: "REVISION_REQUESTED", revisionRequestedAt: now, reviewedAt: now, revisionNote: data.note },
    });
    if (res.count === 0) throw new UserError("Só é possível solicitar ajustes em briefings enviados ou aprovados");
    await notifyClient(b.clientId, "Ajustes solicitados no briefing", `A Unitrix pediu ajustes no briefing "${b.title}".`, { type: "BRIEFING", link: `/cliente/briefing/${bid}` });
    revalidate(bid);
    return { id: bid };
  }, "Ajustes solicitados ao cliente");
}

export async function linkBriefingProject(briefingId: string, projectId: string | null) {
  return safe(async () => {
    await requireAdmin();
    const bid = id.parse(briefingId);
    const pid = projectId ? id.parse(projectId) : null;
    const b = await prisma.briefing.findUnique({ where: { id: bid }, select: { id: true, clientId: true } });
    if (!b) throw new UserError("Briefing não encontrado");
    if (pid) await assertProjectAvailable(pid, b.clientId, bid);
    await prisma.briefing.update({ where: { id: bid }, data: { projectId: pid } });
    revalidate(bid);
    return { id: bid };
  }, pid(projectId));
}

function pid(projectId: string | null) {
  return projectId ? "Projeto vinculado" : "Vínculo removido";
}
