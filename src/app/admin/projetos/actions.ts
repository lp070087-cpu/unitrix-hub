"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";
import { notifyClient } from "@/lib/server/notify";
import { PROJECT_STATUS_MAP } from "@/lib/utils";
import { optionalMoneySchema } from "@/lib/billing/money";
import { optionalDateInputSchema } from "@/lib/billing/dates";
import { ensureProjectCharges } from "@/lib/billing/payments";
import { ensureDelivery, releaseDelivery, saveDelivery } from "@/lib/projects/delivery";
import { recalcProjectProgress } from "@/lib/projects/progress";

const id = z.string().min(1).max(64);
const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_MAP) as [string, ...string[]];

function revalidateProject(projectId?: string) {
  revalidatePath("/admin/projetos");
  revalidatePath("/admin");
  revalidatePath("/cliente/projetos");
  revalidatePath("/cliente");
  if (projectId) {
    revalidatePath(`/admin/projetos/${projectId}`);
    revalidatePath(`/cliente/projetos/${projectId}`);
  }
}

async function getProjectOr404(projectId: string) {
  const p = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, title: true, clientId: true, status: true } });
  if (!p) throw new UserError("Projeto não encontrado");
  return p;
}

// ── Projeto ──

const projectSchema = z
  .object({
    clientId: id,
    title: z.string().trim().min(2, "Informe o título").max(160),
    description: z.string().trim().max(5000).optional(),
    startDate: optionalDateInputSchema,
    endDate: optionalDateInputSchema,
    totalValue: optionalMoneySchema,
    generateCharges: z.boolean().default(true),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { message: "A data de entrega deve ser após o início", path: ["endDate"] });

export async function createProjectAction(input: z.input<typeof projectSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = projectSchema.parse(input);
    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } });
    if (!client) throw new UserError("Cliente não encontrado");

    const project = await prisma.project.create({
      data: {
        clientId: data.clientId, title: data.title, description: data.description || null,
        startDate: data.startDate ?? null, endDate: data.endDate ?? null,
        totalValue: data.totalValue ?? null, status: "PLANNING", stageChangedAt: new Date(),
      },
    });
    await ensureDelivery(project.id);
    if (data.generateCharges && data.totalValue && data.totalValue >= 0.02) await ensureProjectCharges(project.id);
    await notifyClient(data.clientId, "Novo projeto", `O projeto ${project.title} foi criado no seu portal.`, { type: "PROJECT", link: `/cliente/projetos/${project.id}` });
    revalidateProject(project.id);
    revalidatePath("/admin/financeiro");
    return { id: project.id };
  }, "Projeto criado");
}

const infoSchema = z
  .object({
    projectId: id,
    title: z.string().trim().min(2, "Informe o título").max(160),
    description: z.string().trim().max(5000).optional(),
    startDate: optionalDateInputSchema,
    endDate: optionalDateInputSchema,
    totalValue: optionalMoneySchema,
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { message: "A data de entrega deve ser após o início", path: ["endDate"] });

export async function updateProjectInfoAction(input: z.input<typeof infoSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = infoSchema.parse(input);
    await getProjectOr404(data.projectId);
    await prisma.project.update({
      where: { id: data.projectId },
      data: { title: data.title, description: data.description || null, startDate: data.startDate ?? null, endDate: data.endDate ?? null, totalValue: data.totalValue ?? null },
    });
    revalidateProject(data.projectId);
  }, "Projeto atualizado");
}

export async function updateProjectStatusAction(input: { projectId: string; status: string }) {
  return safe(async () => {
    await requireAdmin();
    const data = z.object({ projectId: id, status: z.enum(PROJECT_STATUSES) }).parse(input);
    const project = await getProjectOr404(data.projectId);
    if (project.status === data.status) return;
    if (data.status === "DELIVERED") {
      throw new UserError("Para marcar como entregue, libere a entrega na seção Entrega (exige pagamentos quitados)");
    }
    await prisma.project.update({ where: { id: project.id }, data: { status: data.status, stageChangedAt: new Date() } });
    await notifyClient(project.clientId, "Etapa do projeto atualizada", `${project.title}: ${PROJECT_STATUS_MAP[data.status]?.label ?? data.status}.`, { type: "PROJECT", link: `/cliente/projetos/${project.id}` });
    revalidateProject(project.id);
  }, "Status atualizado");
}

export async function updateInternalNotesAction(input: { projectId: string; internalNotes: string }) {
  return safe(async () => {
    await requireAdmin();
    const data = z.object({ projectId: id, internalNotes: z.string().max(20000) }).parse(input);
    await getProjectOr404(data.projectId);
    await prisma.project.update({ where: { id: data.projectId }, data: { internalNotes: data.internalNotes.trim() || null } });
    revalidatePath(`/admin/projetos/${data.projectId}`);
  }, "Notas salvas");
}

export async function generateProjectChargesAction(input: { projectId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { projectId } = z.object({ projectId: id }).parse(input);
    const r = await ensureProjectCharges(projectId);
    revalidateProject(projectId);
    revalidatePath("/admin/financeiro");
    return r;
  });
}

// ── Etapas ──

const MILESTONE_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

const milestoneSchema = z.object({
  title: z.string().trim().min(2, "Informe o título da etapa").max(160),
  description: z.string().trim().max(2000).optional(),
  dueDate: optionalDateInputSchema,
});

export async function addMilestoneAction(input: z.input<typeof milestoneSchema> & { projectId: string }) {
  return safe(async () => {
    await requireAdmin();
    const projectId = id.parse(input.projectId);
    const data = milestoneSchema.parse(input);
    await getProjectOr404(projectId);
    const last = await prisma.projectMilestone.findFirst({ where: { projectId }, orderBy: { order: "desc" }, select: { order: true } });
    await prisma.projectMilestone.create({ data: { projectId, title: data.title, description: data.description || null, dueDate: data.dueDate ?? null, status: "PENDING", order: (last?.order ?? 0) + 1 } });
    await recalcProjectProgress(projectId);
    revalidateProject(projectId);
  }, "Etapa adicionada");
}

export async function updateMilestoneAction(input: z.input<typeof milestoneSchema> & { milestoneId: string; status: string }) {
  return safe(async () => {
    await requireAdmin();
    const milestoneId = id.parse(input.milestoneId);
    const status = z.enum(MILESTONE_STATUSES).parse(input.status);
    const data = milestoneSchema.parse(input);
    const m = await prisma.projectMilestone.findUnique({ where: { id: milestoneId }, include: { project: { select: { id: true, title: true, clientId: true } } } });
    if (!m) throw new UserError("Etapa não encontrada");
    await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        title: data.title, description: data.description || null, dueDate: data.dueDate ?? null, status,
        completedAt: status === "COMPLETED" ? (m.completedAt ?? new Date()) : null,
      },
    });
    await recalcProjectProgress(m.projectId);
    if (status === "COMPLETED" && m.status !== "COMPLETED") {
      await notifyClient(m.project.clientId, "Etapa concluída", `${m.project.title}: ${data.title}.`, { type: "PROJECT", link: `/cliente/projetos/${m.projectId}` });
    }
    revalidateProject(m.projectId);
  }, "Etapa atualizada");
}

export async function setMilestoneStatusAction(input: { milestoneId: string; status: string }) {
  return safe(async () => {
    await requireAdmin();
    const { milestoneId, status } = z.object({ milestoneId: id, status: z.enum(MILESTONE_STATUSES) }).parse(input);
    const m = await prisma.projectMilestone.findUnique({ where: { id: milestoneId }, include: { project: { select: { title: true, clientId: true } } } });
    if (!m) throw new UserError("Etapa não encontrada");
    if (m.status === status) return;
    await prisma.projectMilestone.update({ where: { id: milestoneId }, data: { status, completedAt: status === "COMPLETED" ? new Date() : null } });
    await recalcProjectProgress(m.projectId);
    if (status === "COMPLETED") {
      await notifyClient(m.project.clientId, "Etapa concluída", `${m.project.title}: ${m.title}.`, { type: "PROJECT", link: `/cliente/projetos/${m.projectId}` });
    }
    revalidateProject(m.projectId);
  });
}

export async function moveMilestoneAction(input: { milestoneId: string; direction: "up" | "down" }) {
  return safe(async () => {
    await requireAdmin();
    const { milestoneId, direction } = z.object({ milestoneId: id, direction: z.enum(["up", "down"]) }).parse(input);
    const m = await prisma.projectMilestone.findUnique({ where: { id: milestoneId }, select: { projectId: true } });
    if (!m) throw new UserError("Etapa não encontrada");
    const list = await prisma.projectMilestone.findMany({ where: { projectId: m.projectId }, orderBy: [{ order: "asc" }, { id: "asc" }], select: { id: true } });
    const idx = list.findIndex((x) => x.id === milestoneId);
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    // Renumera sequencialmente (corrige ordens duplicadas legadas).
    await prisma.$transaction(list.map((x, i) => prisma.projectMilestone.update({ where: { id: x.id }, data: { order: i + 1 } })));
    revalidateProject(m.projectId);
  });
}

export async function deleteMilestoneAction(input: { milestoneId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { milestoneId } = z.object({ milestoneId: id }).parse(input);
    const m = await prisma.projectMilestone.findUnique({ where: { id: milestoneId }, select: { projectId: true } });
    if (!m) throw new UserError("Etapa não encontrada");
    await prisma.projectMilestone.delete({ where: { id: milestoneId } });
    await recalcProjectProgress(m.projectId);
    revalidateProject(m.projectId);
  }, "Etapa removida");
}

// ── Atualizações ──

const updateSchema = z.object({
  projectId: id,
  title: z.string().trim().min(2, "Informe o título").max(160),
  message: z.string().trim().min(2, "Escreva a mensagem").max(5000),
  visible: z.boolean().default(true),
});

export async function addProjectUpdateAction(input: z.input<typeof updateSchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = updateSchema.parse(input);
    const project = await getProjectOr404(data.projectId);
    await prisma.projectUpdate.create({ data: { projectId: project.id, title: data.title, message: data.message, visible: data.visible } });
    if (data.visible) {
      await notifyClient(project.clientId, `Atualização: ${project.title}`, data.title, { type: "PROJECT", link: `/cliente/projetos/${project.id}` });
    }
    revalidateProject(project.id);
  }, "Atualização publicada");
}

export async function deleteProjectUpdateAction(input: { updateId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { updateId } = z.object({ updateId: id }).parse(input);
    const u = await prisma.projectUpdate.findUnique({ where: { id: updateId }, select: { projectId: true } });
    if (!u) throw new UserError("Atualização não encontrada");
    await prisma.projectUpdate.delete({ where: { id: updateId } });
    revalidateProject(u.projectId);
  }, "Atualização removida");
}

// ── Entrega ──

const deliverySchema = z.object({
  projectId: id,
  status: z.enum(["BLOCKED", "READY"]),
  link: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().url("Link inválido").max(500).refine((u) => /^https?:\/\//i.test(u), "Use um link http(s)").optional()),
  documentation: z.string().trim().max(20000).optional(),
  notes: z.string().trim().max(5000).optional(),
  credentials: z.array(z.object({ label: z.string().trim().min(1).max(120), value: z.string().trim().min(1).max(1000) })).max(30).default([]),
});

export async function saveDeliveryAction(input: z.input<typeof deliverySchema>) {
  return safe(async () => {
    await requireAdmin();
    const data = deliverySchema.parse(input);
    await getProjectOr404(data.projectId);
    await saveDelivery(data.projectId, data);
    revalidateProject(data.projectId);
  }, "Entrega salva");
}

export async function releaseDeliveryAction(input: { projectId: string }) {
  return safe(async () => {
    await requireAdmin();
    const { projectId } = z.object({ projectId: id }).parse(input);
    const r = await releaseDelivery(projectId);
    revalidateProject(projectId);
    return r;
  });
}
