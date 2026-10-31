"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, hashIp } from "@/lib/server/request";
import { notifyAdmin } from "@/lib/server/notify";
import { PROJECT_TYPES, BUDGET_RANGES } from "@/lib/utils";

export type LeadField = "name" | "company" | "whatsapp" | "email" | "projectType" | "description" | "budgetRange";

/** ActionResult estendido com erros por campo; `null` = estado inicial do formulário. */
export type LeadActionState =
  | null
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<LeadField, string>> };

const MIN_FILL_MS = 3000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
const SUCCESS_MESSAGE = "Recebemos sua solicitação. Em breve entraremos em contato.";

const optionalText = (max: number, msg: string) =>
  z
    .string()
    .trim()
    .max(max, msg)
    .optional()
    .transform((v) => (v ? v : undefined));

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120, "Nome muito longo"),
  company: optionalText(120, "Nome da empresa muito longo"),
  whatsapp: z
    .string()
    .trim()
    .max(30, "WhatsApp inválido")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 13, "Informe um WhatsApp com DDD (10 a 13 dígitos)"),
  email: z.string().trim().toLowerCase().max(160, "E-mail muito longo").email("Informe um e-mail válido"),
  projectType: z.string().refine((v) => PROJECT_TYPES.includes(v), "Selecione o tipo de projeto"),
  description: z
    .string()
    .trim()
    .min(20, "Descreva o projeto com pelo menos 20 caracteres")
    .max(4000, "Descrição muito longa (máx. 4.000 caracteres)"),
  budgetRange: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || BUDGET_RANGES.includes(v), "Faixa de orçamento inválida"),
});

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : undefined;
}

export async function submitLead(_prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  const silentSuccess: LeadActionState = { ok: true, message: SUCCESS_MESSAGE };

  // Anti-spam: honeypot e tempo mínimo de preenchimento (rejeição silenciosa).
  if ((str(formData, "website") || "").trim().length > 0) return silentSuccess;
  const startedAt = Number(str(formData, "startedAt"));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) return silentSuccess;

  const parsed = schema.safeParse({
    name: str(formData, "name") ?? "",
    company: str(formData, "company"),
    whatsapp: str(formData, "whatsapp") ?? "",
    email: str(formData, "email") ?? "",
    projectType: str(formData, "projectType") ?? "",
    description: str(formData, "description") ?? "",
    budgetRange: str(formData, "budgetRange"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<LeadField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as LeadField | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revise os campos destacados.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const { ip, userAgent } = await getRequestMeta();
    const ipHash = hashIp(ip);
    const now = Date.now();

    const recent = await prisma.lead.count({
      where: { ipHash, createdAt: { gte: new Date(now - RATE_WINDOW_MS) } },
    });
    if (recent >= RATE_MAX) {
      return {
        ok: false,
        error: "Recebemos várias solicitações em sequência. Aguarde alguns minutos e tente novamente.",
      };
    }

    const duplicate = await prisma.lead.findFirst({
      where: { email: data.email, description: data.description, createdAt: { gte: new Date(now - DEDUPE_WINDOW_MS) } },
      select: { id: true },
    });
    if (duplicate) return silentSuccess;

    await prisma.lead.create({
      data: {
        name: data.name,
        company: data.company,
        whatsapp: data.whatsapp,
        email: data.email,
        projectType: data.projectType,
        description: data.description,
        budgetRange: data.budgetRange,
        source: "landing",
        ipHash,
        userAgent,
      },
    });

    await notifyAdmin(
      "Nova solicitação de projeto",
      `${data.name}${data.company ? ` (${data.company})` : ""} — ${data.projectType}`,
      { type: "LEAD", link: "/admin/solicitacoes" }
    );

    return silentSuccess;
  } catch (e) {
    console.error("[lead] falha ao registrar solicitação", (e as Error)?.message);
    return { ok: false, error: "Não foi possível enviar agora. Tente novamente em instantes." };
  }
}
