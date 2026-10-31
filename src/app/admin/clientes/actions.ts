"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/session";
import { safe, UserError } from "@/lib/server/action";

const opt = (max = 200) => z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  company: opt(120),
  document: opt(30),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(160),
  phone: opt(30),
  address: opt(200),
  city: opt(80),
  segment: opt(80),
  projectType: opt(80),
  budget: z.preprocess((v) => (v === "" || v == null ? undefined : String(v).replace(",", ".")), z.coerce.number().nonnegative("Orçamento inválido").max(99999999).optional()),
  status: z.string().default("LEAD"),
  password: z.string().max(100).optional().transform((v) => (v ? v : undefined)).refine((v) => !v || v.length >= 8, "A senha deve ter ao menos 8 caracteres"),
});

async function assertEmailFree(email: string, exceptClientId?: string) {
  const [admin, client] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.client.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (admin) throw new UserError("Este e-mail pertence a um usuário administrativo");
  if (client && client.id !== exceptClientId) throw new UserError("Já existe um cliente com este e-mail");
}

export async function createClient(formData: FormData) {
  return safe(async () => {
    const session = await requireAdmin();
    const parsed = clientSchema.parse(Object.fromEntries(formData));
    await assertEmailFree(parsed.email);
    const { password, ...data } = parsed;
    const client = await prisma.client.create({
      data: { ...data, passwordHash: password ? await bcrypt.hash(password, 12) : undefined, createdById: session.user.id },
      select: { id: true },
    });
    const leadId = formData.get("leadId");
    if (typeof leadId === "string" && leadId) {
      await prisma.lead.updateMany({ where: { id: leadId }, data: { status: "CONVERTED", convertedClientId: client.id } });
      revalidatePath("/admin/solicitacoes");
    }
    revalidatePath("/admin/clientes");
    return client;
  }, "Cliente cadastrado");
}

export async function updateClient(id: string, formData: FormData) {
  return safe(async () => {
    await requireAdmin();
    const parsed = clientSchema.parse(Object.fromEntries(formData));
    await assertEmailFree(parsed.email, id);
    const { password, ...rest } = parsed;
    const data: Record<string, unknown> = {
      ...rest,
      company: rest.company ?? null, document: rest.document ?? null, phone: rest.phone ?? null, address: rest.address ?? null,
      city: rest.city ?? null, segment: rest.segment ?? null, projectType: rest.projectType ?? null, budget: rest.budget ?? null,
    };
    if (password) data.passwordHash = await bcrypt.hash(password, 12);
    await prisma.client.update({ where: { id }, data, select: { id: true } });
    revalidatePath("/admin/clientes");
    revalidatePath(`/admin/clientes/${id}`);
  }, "Cliente atualizado");
}

export async function updateClientStatus(id: string, status: string) {
  return safe(async () => {
    await requireAdmin();
    const s = z.enum(["LEAD", "BRIEFING", "PROPOSAL_SENT", "NEGOTIATION", "CONTRACTED", "IN_PROGRESS", "COMPLETED", "SUBSCRIBER", "CANCELLED"]).parse(status);
    await prisma.client.update({ where: { id }, data: { status: s } });
    revalidatePath(`/admin/clientes/${id}`);
    revalidatePath("/admin/clientes");
  }, "Status atualizado");
}

export async function revokeClientAccess(id: string) {
  return safe(async () => {
    await requireAdmin();
    await prisma.client.update({ where: { id }, data: { passwordHash: null } });
    revalidatePath(`/admin/clientes/${id}`);
  }, "Acesso ao portal revogado");
}

export async function deleteClient(id: string) {
  return safe(async () => {
    await requireAdmin();
    const c = await prisma.client.findUnique({
      where: { id },
      select: { _count: { select: { projects: true, contracts: true, payments: true, subscriptions: true, presentations: true, briefings: true } } },
    });
    if (!c) throw new UserError("Cliente não encontrado");
    const linked = Object.values(c._count).reduce((a, b) => a + b, 0);
    if (linked > 0) throw new UserError("Cliente possui registros vinculados. Altere o status para Cancelado em vez de excluir.");
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { clientId: id } }),
      prisma.lead.updateMany({ where: { convertedClientId: id }, data: { convertedClientId: null } }),
      prisma.client.delete({ where: { id } }),
    ]);
    revalidatePath("/admin/clientes");
  }, "Cliente excluído");
}
