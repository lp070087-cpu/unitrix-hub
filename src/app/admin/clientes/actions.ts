"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

/** Require authenticated ADMIN session — throws if not met. */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
  if (session.user.role !== "ADMIN") throw new Error("Acesso não autorizado");
  return session;
}

const clientSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  company: z.string().optional(),
  document: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  segment: z.string().optional(),
  projectType: z.string().optional(),
  budget: z.coerce.number().optional(),
  status: z.string().default("LEAD"),
  password: z.string().min(6, "Senha mínima de 6 caracteres").optional(),
});

export async function createClient(formData: FormData) {
  const session = await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = clientSchema.parse(raw);

  let passwordHash: string | undefined;
  if (parsed.password) {
    passwordHash = await bcrypt.hash(parsed.password, 12);
  }

  const client = await prisma.client.create({
    data: {
      name: parsed.name,
      company: parsed.company,
      document: parsed.document,
      email: parsed.email,
      phone: parsed.phone,
      address: parsed.address,
      city: parsed.city,
      segment: parsed.segment,
      projectType: parsed.projectType,
      budget: parsed.budget,
      status: parsed.status,
      passwordHash,
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/clientes");
  return client;
}

export async function updateClient(id: string, formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = clientSchema.partial().parse(raw);

  const data: Record<string, unknown> = { ...parsed };
  if (parsed.password) {
    data.passwordHash = await bcrypt.hash(parsed.password, 12);
  }
  delete data.password;

  const client = await prisma.client.update({ where: { id }, data });
  revalidatePath("/admin/clientes");
  return client;
}

export async function deleteClient(id: string) {
  await requireAdmin();

  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clientes");
}

export async function getClientById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  // Admin sees all; clients only see their own data
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      presentations: true,
      contracts: true,
      projects: { include: { milestones: true } },
      payments: true,
      subscriptions: { include: { plan: true } },
    },
  });

  // If client, verify they own this record
  if (session.user.role !== "ADMIN" && client?.email !== session.user.email) {
    throw new Error("Acesso não autorizado");
  }

  return client;
}
