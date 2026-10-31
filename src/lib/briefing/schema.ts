import { z } from "zod";

export const BRIEFING_FILE_KINDS = { LOGO: "Logo", REFERENCE: "Referência", DOCUMENT: "Documento", OTHER: "Outro" } as const;
export type BriefingFileKind = keyof typeof BRIEFING_FILE_KINDS;

export const BRIEFING_EDITABLE = ["DRAFT", "REVISION_REQUESTED"];

const txt = (max: number) =>
  z
    .string()
    .max(max, "Texto muito longo")
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null));

const triBool = z
  .union([z.boolean(), z.null(), z.literal(""), z.literal("yes"), z.literal("no")])
  .optional()
  .transform((v) => (v === true || v === "yes" ? true : v === false || v === "no" ? false : null));

export const briefingFieldsSchema = z.object({
  projectKind: txt(120),
  niche: txt(200),
  companyName: txt(200),
  mainGoal: txt(4000),
  targetAudience: txt(4000),
  productsServices: txt(4000),
  references: txt(4000),
  competitors: txt(4000),
  desiredFeatures: txt(8000),
  visualStyle: txt(2000),
  preferredColors: txt(500),
  avoidedColors: txt(500),
  hasLogo: triBool,
  domain: txt(255),
  hosting: txt(500),
  integrations: txt(4000),
  needsAi: triBool,
  aiNeeds: txt(4000),
  notes: txt(4000),
  additionalInfo: txt(8000),
});

export const briefingFileSchema = z.object({
  kind: z.enum(["LOGO", "REFERENCE", "DOCUMENT", "OTHER"]).default("OTHER"),
  label: z.string().trim().min(1, "Informe a descrição do link").max(160),
  externalUrl: z
    .string()
    .trim()
    .max(2000)
    .url("Link inválido")
    .refine((u) => u.startsWith("https://"), "Use links https://"),
});

export const briefingSaveSchema = z.object({
  title: z.string().trim().min(3, "Informe um título").max(160),
  fields: briefingFieldsSchema,
  files: z.array(briefingFileSchema).max(20, "Máximo de 20 links"),
});

export type BriefingFields = z.input<typeof briefingFieldsSchema>;
export type BriefingFileInput = z.input<typeof briefingFileSchema>;
export type BriefingSaveInput = z.input<typeof briefingSaveSchema>;

/** Campos mínimos para enviar para análise. */
export function submissionErrors(f: z.output<typeof briefingFieldsSchema>) {
  const missing: string[] = [];
  if (!f.projectKind) missing.push("tipo de projeto");
  if (!f.companyName) missing.push("nome da empresa");
  if (!f.mainGoal) missing.push("objetivo principal");
  if (!f.targetAudience) missing.push("público-alvo");
  return missing;
}

export type FieldDef = { key: keyof BriefingFields; label: string; hint?: string; type?: "text" | "textarea" | "bool" | "kind"; rows?: number; placeholder?: string };

export const BRIEFING_STEPS: { id: string; title: string; description: string; fields: FieldDef[] }[] = [
  {
    id: "projeto",
    title: "O projeto",
    description: "O que vamos construir e para quem é a empresa.",
    fields: [
      { key: "projectKind", label: "Tipo de projeto", type: "kind" },
      { key: "companyName", label: "Nome da empresa / marca", type: "text" },
      { key: "niche", label: "Segmento ou nicho", type: "text", placeholder: "Ex.: clínica odontológica, SaaS B2B, varejo de moda" },
      { key: "mainGoal", label: "Objetivo principal", type: "textarea", hint: "Qual resultado o projeto precisa gerar? Ex.: captar leads, vender online, automatizar processo interno." },
    ],
  },
  {
    id: "negocio",
    title: "Negócio e público",
    description: "Quem são seus clientes e o que você oferece.",
    fields: [
      { key: "targetAudience", label: "Público-alvo", type: "textarea" },
      { key: "productsServices", label: "Produtos e serviços", type: "textarea" },
      { key: "competitors", label: "Concorrentes", type: "textarea", hint: "Nomes ou sites de concorrentes e o que você admira ou evita neles." },
    ],
  },
  {
    id: "funcionalidades",
    title: "Funcionalidades",
    description: "O que o produto precisa fazer.",
    fields: [
      { key: "desiredFeatures", label: "Funcionalidades desejadas", type: "textarea", rows: 6, hint: "Liste páginas, recursos, áreas restritas, pagamentos etc." },
      { key: "integrations", label: "Integrações", type: "textarea", hint: "Ex.: WhatsApp, CRM, gateway de pagamento, ERP, Google Analytics." },
      { key: "needsAi", label: "O projeto envolve inteligência artificial?", type: "bool" },
      { key: "aiNeeds", label: "Como a IA deveria ajudar?", type: "textarea" },
    ],
  },
  {
    id: "visual",
    title: "Identidade visual",
    description: "Estilo, cores e referências.",
    fields: [
      { key: "hasLogo", label: "Já possui logotipo?", type: "bool" },
      { key: "visualStyle", label: "Estilo visual desejado", type: "textarea", placeholder: "Ex.: minimalista, sofisticado, tecnológico, acolhedor" },
      { key: "preferredColors", label: "Cores preferidas", type: "text" },
      { key: "avoidedColors", label: "Cores a evitar", type: "text" },
      { key: "references", label: "Referências", type: "textarea", hint: "Sites, apps ou marcas que inspiram. Links também podem ser adicionados na última etapa." },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura e materiais",
    description: "Domínio, hospedagem, links e observações finais.",
    fields: [
      { key: "domain", label: "Domínio", type: "text", placeholder: "Ex.: suaempresa.com.br (ou \"ainda não tenho\")" },
      { key: "hosting", label: "Hospedagem atual", type: "text" },
      { key: "notes", label: "Observações", type: "textarea" },
      { key: "additionalInfo", label: "Informações adicionais", type: "textarea" },
    ],
  },
];

export const ALL_FIELD_DEFS: FieldDef[] = BRIEFING_STEPS.flatMap((s) => s.fields);
