import { z } from "zod";

/** Converte reais (number) em centavos inteiros, sem erro de ponto flutuante. */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/** Divide o total em entrada/saldo 50/50. Saldo = total − entrada (centavos exatos). */
export function splitFiftyFifty(total: number): { deposit: number; balance: number } {
  const cents = toCents(total);
  const deposit = Math.round(cents / 2);
  return { deposit: fromCents(deposit), balance: fromCents(cents - deposit) };
}

const MAX = 99_999_999.99; // Decimal(10,2)

/** Valor monetário positivo com até 2 casas decimais (aceita "1.234,56" e "1234.56"). */
export const moneySchema = z.preprocess(
  (v) => {
    if (typeof v === "number") return v;
    if (typeof v !== "string") return v;
    const s = v.trim().replace(/\s|R\$/g, "");
    if (!s) return undefined;
    const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
    return Number(normalized);
  },
  z
    .number({ required_error: "Informe o valor", invalid_type_error: "Valor inválido" })
    .positive("O valor deve ser maior que zero")
    .max(MAX, "Valor acima do limite")
    .refine((n) => Math.abs(toCents(n) - n * 100) < 1e-6, "Use no máximo 2 casas decimais")
);

/** Valor monetário opcional (vazio → undefined). */
export const optionalMoneySchema = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  moneySchema.optional()
);
