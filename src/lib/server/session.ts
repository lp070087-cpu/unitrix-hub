import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class AuthError extends Error {}

/** Exige sessão ADMIN válida. Lança erro em caso contrário. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new AuthError("Não autenticado");
  if (session.user.role !== "ADMIN") throw new AuthError("Acesso não autorizado");
  return session;
}

/** Exige sessão CLIENT e retorna o id do cliente (ownership vem do token, nunca do input). */
export async function requireClient() {
  const session = await auth();
  if (!session?.user) throw new AuthError("Não autenticado");
  if (session.user.role !== "CLIENT" || !session.user.id) throw new AuthError("Acesso não autorizado");
  const client = await prisma.client.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, company: true } });
  if (!client) throw new AuthError("Cliente não encontrado");
  return { session, client, clientId: client.id };
}
