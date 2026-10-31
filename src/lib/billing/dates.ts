import { z } from "zod";

/**
 * Datas de cobrança são armazenadas como meia-noite UTC do dia civil
 * (mesmo formato de `new Date("YYYY-MM-DD")`). "Hoje" é o dia civil em São Paulo.
 */
export function todayUTC(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return new Date(`${parts}T00:00:00.000Z`);
}

export function addDaysUTC(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function startOfMonthUTC(date: Date, offsetMonths = 0): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offsetMonths, 1));
}

/** "YYYY-MM-DD" → Date UTC (meia-noite). */
export const dateInputSchema = z
  .string({ required_error: "Informe a data" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
  .transform((s) => new Date(`${s}T00:00:00.000Z`))
  .refine((d) => !Number.isNaN(d.getTime()), "Data inválida");

export const optionalDateInputSchema = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  dateInputSchema.optional()
);
