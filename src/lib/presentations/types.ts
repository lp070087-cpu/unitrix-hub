import { z } from "zod";

export const SECTION_TYPES = ["text", "features", "timeline", "investment", "cta"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABEL: Record<SectionType, string> = {
  text: "Texto",
  features: "Destaques / entregáveis",
  timeline: "Cronograma",
  investment: "Investimento",
  cta: "Chamada final",
};

const text = (max: number) => z.string().max(max, "Texto muito longo").default("");

export const itemSchema = z.object({
  title: text(200),
  description: text(2000),
});

export const sectionSchema = z.object({
  id: z.string().min(1).max(40),
  type: z.enum(SECTION_TYPES),
  title: text(200),
  body: z.string().max(8000).optional(),
  items: z.array(itemSchema).max(30).optional(),
  amount: z.number().nonnegative().max(99_999_999).nullable().optional(),
  notes: z.string().max(4000).optional(),
});

export const presentationContentSchema = z.object({
  hero: z.object({ eyebrow: text(120), title: text(200), subtitle: text(1200) }),
  sections: z.array(sectionSchema).max(30),
  theme: z.enum(["dark", "paper"]).optional(),
});

export type PresentationItem = z.infer<typeof itemSchema>;
export type PresentationSection = z.infer<typeof sectionSchema>;
export type PresentationContent = z.infer<typeof presentationContentSchema>;

export function newSectionId() {
  return `s${Math.random().toString(36).slice(2, 10)}`;
}

export function emptySection(type: SectionType): PresentationSection {
  const base = { id: newSectionId(), type, title: "" } as PresentationSection;
  switch (type) {
    case "text":
      return { ...base, body: "" };
    case "features":
    case "timeline":
      return { ...base, items: [{ title: "", description: "" }] };
    case "investment":
      return { ...base, amount: null, body: "", notes: "", items: [] };
    case "cta":
      return { ...base, body: "" };
  }
}

/** Template inicial: estrutura sugerida, sem números ou promessas inventadas. */
export function defaultPresentationContent(input: { title: string; clientName?: string | null; projectValue?: number | null }): PresentationContent {
  return {
    theme: "dark",
    hero: {
      eyebrow: input.clientName ? `Proposta para ${input.clientName}` : "Proposta Unitrix",
      title: input.title,
      subtitle: "",
    },
    sections: [
      { id: newSectionId(), type: "text", title: "Contexto e objetivo", body: "" },
      { id: newSectionId(), type: "features", title: "O que vamos construir", items: [{ title: "", description: "" }] },
      { id: newSectionId(), type: "timeline", title: "Como vamos trabalhar", items: [{ title: "Descoberta e briefing", description: "" }, { title: "Design e validação", description: "" }, { title: "Desenvolvimento", description: "" }, { title: "Entrega e publicação", description: "" }] },
      { id: newSectionId(), type: "investment", title: "Investimento", amount: input.projectValue && input.projectValue > 0 ? input.projectValue : null, body: "", notes: "Pagamento em duas parcelas: 50% de entrada e 50% na entrega.", items: [] },
      { id: newSectionId(), type: "cta", title: "Próximos passos", body: "" },
    ],
  };
}

/** Faz o parse tolerante do JSON salvo (registros antigos/inválidos não quebram a página). */
export function parsePresentationContent(value: unknown, fallbackTitle: string): PresentationContent {
  const res = presentationContentSchema.safeParse(value);
  if (res.success) return res.data;
  return defaultPresentationContent({ title: fallbackTitle });
}
