/**
 * Datas "de calendário" (vencimentos, prazos) são gravadas como meia-noite UTC;
 * formatá-las em UTC evita exibir o dia anterior no fuso de São Paulo.
 */
export function formatDay(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", ...opts, timeZone: "UTC" }).format(new Date(date));
}

export function dayInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}
