import "server-only";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AuthError } from "./session";

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/** Padroniza retorno de Server Actions: nunca vaza stack/SQL para o cliente. */
export async function safe<T>(fn: () => Promise<T>, success?: string): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message: success };
  } catch (e) {
    if (e instanceof ZodError) return { ok: false, error: e.issues[0]?.message || "Dados inválidos" };
    if (e instanceof AuthError) return { ok: false, error: e.message };
    if (e instanceof UserError) return { ok: false, error: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return { ok: false, error: "Registro duplicado" };
      if (e.code === "P2025") return { ok: false, error: "Registro não encontrado" };
      if (e.code === "P2003") return { ok: false, error: "Existem registros vinculados" };
    }
    console.error("[action]", (e as Error)?.message);
    return { ok: false, error: "Erro inesperado. Tente novamente." };
  }
}

export class UserError extends Error {}
