"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/** Require authenticated ADMIN session — throws if not met. */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
  if (session.user.role !== "ADMIN") throw new Error("Acesso não autorizado");
  return session;
}

const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  clientId: z.string(),
});

// ── Projetos ──

export async function createProject(formData: FormData) {
  await requireAdmin();
  const parsed = projectSchema.parse(Object.fromEntries(formData));
  const project = await prisma.project.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      clientId: parsed.clientId,
    },
  });
  revalidatePath("/admin/projetos");
  return project;
}

export async function updateProjectProgress(id: string, progress: number) {
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { progress } });
  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
}

export async function updateProjectStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { status } });
  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
}

// ── Milestones ──

export async function addMilestone(projectId: string, formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ title: z.string(), order: z.coerce.number() }).parse(Object.fromEntries(formData));
  const m = await prisma.projectMilestone.create({
    data: { title: parsed.title, order: parsed.order, projectId, status: "PENDING" },
  });
  revalidatePath(`/admin/projetos/${projectId}`);
  return m;
}

export async function toggleMilestone(milestoneId: string) {
  await requireAdmin();
  const m = await prisma.projectMilestone.findUnique({ where: { id: milestoneId }, include: { project: true } });
  if (!m) throw new Error("Milestone não encontrada");

  const newStatus = m.status === "COMPLETED" ? "PENDING" : "COMPLETED";
  await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: { status: newStatus, completedAt: newStatus === "COMPLETED" ? new Date() : null },
  });

  // Recalcula progresso do projeto
  const milestones = await prisma.projectMilestone.findMany({ where: { projectId: m.projectId } });
  const done = milestones.filter(ml => ml.status === "COMPLETED").length;
  const progress = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;
  await prisma.project.update({ where: { id: m.projectId }, data: { progress } });

  revalidatePath(`/admin/projetos/${m.projectId}`);
  revalidatePath("/admin/projetos");
}

// ── Pagamentos ──

export async function createPayment(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    description: z.string(), amount: z.coerce.number(),
    type: z.string(), clientId: z.string(), projectId: z.string().optional(),
  }).parse(Object.fromEntries(formData));

  const payment = await prisma.payment.create({ data: parsed });
  revalidatePath("/admin/financeiro");
  revalidatePath(`/admin/clientes/${parsed.clientId}`);
  return payment;
}

export async function markPaymentPaid(paymentId: string) {
  await requireAdmin();
  const p = await prisma.payment.update({
    where: { id: paymentId }, data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/admin/financeiro");
  revalidatePath(`/admin/clientes/${p.clientId}`);
  return p;
}
