"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { notifyClient } from "@/lib/server/notify";
import { unguessableSlug } from "@/lib/contracts/slug";
import { defaultPresentationContent, presentationContentSchema, type PresentationContent } from "@/lib/presentations/types";

const id = z.string().min(1).max(64);

function revalidate(pid?: string, slug?: string) {
  revalidatePath("/admin/apresentacoes");
  revalidatePath("/cliente/apresentacoes");
  if (pid) revalidatePath(`/admin/apresentacoes/${pid}`);
  if (slug) revalidatePath(`/apresentacao/${slug}`);
}

async function assertProject(projectId: string | null, clientId: string) {
  if (!projectId) return null;
  const p = await prisma.project.findFirst({ where: { id: projectId, clientId }, select: { id: true, title: true, totalValue: true } });
  if (!p) throw new UserError("Projeto não pertence a este cliente");
  return p;
}

const createSchema = z.object({
  clientId: z.string().min(1, "Selecione o cliente"),
  projectId: z.string().optional().transform((v) => v || null),
  title: z.string().trim().min(3, "Informe um título").max(160),
});

export async function createPresentation(input: z.input<typeof createSchema>) {
  return safe(async () => {
    const session = await requireAdmin();
    const data = createSchema.parse(input);
    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true, name: true, company: true } });
    if (!client) throw new UserError("Cliente não encontrado");
    const project = await assertProject(data.projectId, client.id);
    const content = defaultPresentationContent({
      title: data.title,
      clientName: client.company || client.name,
      projectValue: project?.totalValue ? Number(project.totalValue) : null,
    });
    const p = await prisma.presentation.create({
      data: {
        title: data.title,
        slug: unguessableSlug(data.title),
        status: "DRAFT",
        content: content as unknown as Prisma.InputJsonValue,
        clientId: client.id,
        projectId: project?.id ?? null,
        createdById: session.user.id,
      },
      select: { id: true },
    });
    revalidate(p.id);
    return { id: p.id };
  }, "Apresentação criada");
}

const saveSchema = z.object({
  title: z.string().trim().min(3, "Informe um título").max(160),
  projectId: z.string().optional().transform((v) => v || null),
  content: presentationContentSchema,
});

export async function savePresentation(presentationId: string, input: { title: string; projectId?: string; content: PresentationContent }) {
  return safe(async () => {
    await requireAdmin();
    const pid = id.parse(presentationId);
    const data = saveSchema.parse(input);
    const current = await prisma.presentation.findUnique({ where: { id: pid }, select: { clientId: true, slug: true, status: true } });
    if (!current) throw new UserError("Apresentação não encontrada");
    if (current.status === "ACCEPTED") throw new UserError("Propostas aprovadas não podem ser editadas");
    const project = await assertProject(data.projectId, current.clientId);
    await prisma.presentation.update({
      where: { id: pid },
      data: { title: data.title, projectId: project?.id ?? null, content: data.content as unknown as Prisma.InputJsonValue },
    });
    revalidate(pid, current.slug);
    return { id: pid };
  }, "Apresentação salva");
}

export async function sendPresentation(presentationId: string) {
  return safe(async () => {
    await requireAdmin();
    const pid = id.parse(presentationId);
    const p = await prisma.presentation.findUnique({ where: { id: pid }, select: { id: true, slug: true, status: true, title: true, clientId: true } });
    if (!p) throw new UserError("Apresentação não encontrada");
    if (p.status === "ACCEPTED") throw new UserError("Esta proposta já foi aprovada");
    const first = p.status === "DRAFT" || p.status === "ARCHIVED";
    await prisma.presentation.update({
      where: { id: pid },
      data: first ? { status: "SENT", sentAt: new Date() } : { sentAt: new Date() },
    });
    await notifyClient(p.clientId, first ? "Nova apresentação disponível" : "Lembrete: apresentação aguardando sua análise", `A apresentação "${p.title}" está disponível para você.`, {
      type: "INFO",
      link: `/apresentacao/${p.slug}`,
    });
    revalidate(pid, p.slug);
    return { id: pid };
  }, "Apresentação enviada ao cliente");
}

const statusSchema = z.enum(["DRAFT", "ARCHIVED"]);

export async function setPresentationStatus(presentationId: string, status: "DRAFT" | "ARCHIVED") {
  return safe(async () => {
    await requireAdmin();
    const pid = id.parse(presentationId);
    const next = statusSchema.parse(status);
    const p = await prisma.presentation.findUnique({ where: { id: pid }, select: { slug: true, status: true } });
    if (!p) throw new UserError("Apresentação não encontrada");
    if (p.status === "ACCEPTED" && next === "DRAFT") throw new UserError("Propostas aprovadas não voltam para rascunho");
    await prisma.presentation.update({ where: { id: pid }, data: { status: next } });
    revalidate(pid, p.slug);
    return { status: next };
  }, "Status atualizado");
}
