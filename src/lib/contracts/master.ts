/**
 * Contrato Mestre Unitrix de Prestação de Serviços de Desenvolvimento.
 *
 * Template em cláusulas. `renderContract()` gera um snapshot JSON (congelado
 * em `Contract.contentSnapshot`) com todos os placeholders preenchidos.
 *
 * IMPORTANTE: este é um modelo de referência. Não substitui revisão por
 * assessoria jurídica e não garante validade jurídica absoluta.
 */
import { formatCurrency } from "@/lib/utils";

export const CONTRACT_TEMPLATE_ID = "unitrix-master-v1";
export const CONTRACT_TEMPLATE_NAME = "Contrato Mestre Unitrix de Prestação de Serviços de Desenvolvimento";

const PENDING = "[a definir]";

export type ContractRenderInput = {
  title: string;
  version: number;
  client: { name: string; document?: string | null; company?: string | null; email?: string | null; address?: string | null; city?: string | null };
  project?: { title: string } | null;
  projectType?: string | null;
  scope: string;
  value: number;
  deadline: Date | string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  deliveryPeriod?: string | null;
  conditions?: string | null;
};

export type ContractParty = { role: string; name: string; document: string; address: string; extra?: string };
export type ContractSection = { number: number; title: string; paragraphs: string[] };
export type ContractSnapshot = {
  schema: 1;
  templateId: string;
  templateName: string;
  title: string;
  version: number;
  generatedAt: string;
  parties: { contratada: ContractParty; contratante: ContractParty };
  summary: { label: string; value: string }[];
  preamble: string;
  sections: ContractSection[];
  notice: string;
};

export function getContractorInfo() {
  return {
    name: process.env.UNITRIX_LEGAL_NAME?.trim() || "Unitrix",
    document: process.env.UNITRIX_LEGAL_DOCUMENT?.trim() || PENDING,
    address: process.env.UNITRIX_LEGAL_ADDRESS?.trim() || PENDING,
  };
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return PENDING;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return PENDING;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function or(v: string | null | undefined, fallback = PENDING) {
  const t = (v ?? "").trim();
  return t || fallback;
}

export function renderContract(data: ContractRenderInput): ContractSnapshot {
  const contractor = getContractorInfo();
  const total = Math.max(0, Number(data.value) || 0);
  const half = Math.round(total * 50) / 100;
  const rest = Math.round((total - half) * 100) / 100;
  const clientName = data.client.company ? `${data.client.company} (representada por ${data.client.name})` : data.client.name;
  const clientAddress = [data.client.address, data.client.city].filter(Boolean).join(" — ") || PENDING;
  const projectLabel = data.project?.title || data.title;

  const contratada: ContractParty = { role: "CONTRATADA", name: contractor.name, document: contractor.document, address: contractor.address };
  const contratante: ContractParty = {
    role: "CONTRATANTE",
    name: clientName,
    document: or(data.client.document),
    address: clientAddress,
    extra: data.client.email || undefined,
  };

  const summary = [
    { label: "Projeto", value: projectLabel },
    ...(data.projectType ? [{ label: "Tipo", value: data.projectType }] : []),
    { label: "Valor total", value: formatCurrency(total) },
    { label: "Início", value: fmtDate(data.startDate) },
    { label: "Prazo final", value: fmtDate(data.deadline) },
    { label: "Período de entrega", value: or(data.deliveryPeriod, "Conforme cronograma do projeto") },
  ];

  const sections: Omit<ContractSection, "number">[] = [
    {
      title: "Do objeto e do escopo",
      paragraphs: [
        `O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços de desenvolvimento referentes ao projeto "${projectLabel}"${data.projectType ? ` (${data.projectType})` : ""}, conforme o escopo descrito a seguir:`,
        or(data.scope),
        "Itens não descritos expressamente neste escopo não estão incluídos no objeto deste contrato e, se solicitados, serão tratados conforme a cláusula de alterações de escopo.",
      ],
    },
    {
      title: "Do prazo e do período de entrega",
      paragraphs: [
        `Os serviços terão início em ${fmtDate(data.startDate)}, ou na data de confirmação do pagamento da entrada, o que ocorrer por último, com previsão de conclusão até ${fmtDate(data.deadline)}${data.endDate ? ` e encerramento contratual em ${fmtDate(data.endDate)}` : ""}.`,
        `Período de entrega: ${or(data.deliveryPeriod, "conforme cronograma acordado entre as partes no painel do projeto")}.`,
        "Os prazos ficam suspensos enquanto houver pendência de responsabilidade do CONTRATANTE, como envio de briefing, conteúdos, acessos, aprovações ou pagamentos, sendo prorrogados pelo mesmo período do atraso.",
      ],
    },
    {
      title: "Do valor e da forma de pagamento",
      paragraphs: [
        `Pelos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor total de ${formatCurrency(total)}.`,
        `O pagamento será realizado em duas parcelas: (a) 50% (cinquenta por cento), no valor de ${formatCurrency(half)}, a título de entrada, como condição para início dos trabalhos; e (b) 50% (cinquenta por cento), no valor de ${formatCurrency(rest)}, na entrega do projeto.`,
        "A liberação final do projeto — incluindo publicação definitiva, transferência de arquivos-fonte, credenciais e acessos administrativos — fica condicionada à confirmação do pagamento integral.",
        "O atraso no pagamento poderá implicar a suspensão dos serviços até a regularização, sem prejuízo dos prazos ficarem prorrogados pelo período correspondente.",
      ],
    },
    {
      title: "Das obrigações da CONTRATADA",
      paragraphs: [
        "Executar os serviços com diligência, qualidade técnica e de acordo com o escopo contratado.",
        "Manter o CONTRATANTE informado sobre o andamento do projeto por meio do portal do cliente ou de outro canal acordado.",
        "Corrigir, sem custo adicional, falhas comprovadamente decorrentes de sua execução, identificadas durante a fase de validação.",
        "Guardar sigilo sobre as informações do CONTRATANTE, nos termos da cláusula de confidencialidade.",
      ],
    },
    {
      title: "Das obrigações do CONTRATANTE",
      paragraphs: [
        "Efetuar os pagamentos nas datas e condições pactuadas.",
        "Fornecer, em tempo hábil, briefing, conteúdos (textos, imagens, marcas), acessos e informações necessárias à execução dos serviços, responsabilizando-se pela titularidade e licitude do material fornecido.",
        "Analisar e responder às solicitações de validação e aprovação dentro de prazo razoável.",
        "Designar um responsável para comunicação e aprovações em nome do CONTRATANTE.",
      ],
    },
    {
      title: "Do briefing e das aprovações",
      paragraphs: [
        "O briefing preenchido e aprovado pelas partes integra este contrato e orienta a execução dos serviços.",
        "Cada etapa entregue será submetida à validação do CONTRATANTE. A aprovação, expressa ou registrada no portal, encerra a etapa correspondente; ajustes posteriores que alterem o que foi aprovado poderão ser tratados como alteração de escopo.",
        "A ausência de manifestação do CONTRATANTE por prazo superior a 10 (dez) dias úteis após a solicitação de validação poderá ser considerada aprovação tácita da etapa, mediante comunicação prévia da CONTRATADA.",
      ],
    },
    {
      title: "Das alterações de escopo e funcionalidades adicionais",
      paragraphs: [
        "Solicitações de novas funcionalidades, páginas, integrações ou mudanças relevantes no que foi definido no escopo serão avaliadas pela CONTRATADA, que apresentará orçamento e impacto no prazo.",
        "Alterações somente serão executadas após aprovação do orçamento pelo CONTRATANTE, formalizada por aditivo ou nova versão deste contrato.",
      ],
    },
    {
      title: "Da propriedade intelectual",
      paragraphs: [
        "Após a quitação integral dos valores devidos, os direitos patrimoniais sobre os entregáveis desenvolvidos especificamente para o CONTRATANTE serão a ele transferidos.",
        "Permanecem de titularidade da CONTRATADA ou de seus respectivos licenciantes as bibliotecas, frameworks, componentes reutilizáveis, ferramentas e conhecimentos pré-existentes ou de uso genérico, cuja utilização é licenciada ao CONTRATANTE de forma não exclusiva, na medida necessária ao funcionamento do projeto.",
        "Softwares de terceiros e de código aberto seguem suas próprias licenças.",
        "Salvo manifestação contrária do CONTRATANTE, a CONTRATADA poderá mencionar o projeto em seu portfólio, sem divulgar informações confidenciais.",
      ],
    },
    {
      title: "Da confidencialidade e da proteção de dados pessoais",
      paragraphs: [
        "As partes comprometem-se a manter em sigilo as informações confidenciais a que tiverem acesso em razão deste contrato, durante sua vigência e após o seu término.",
        "No tratamento de dados pessoais, as partes observarão a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD). Quando a CONTRATADA tratar dados pessoais em nome do CONTRATANTE, atuará como operadora, conforme as instruções do CONTRATANTE, que figura como controlador.",
        "Cada parte adotará medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas.",
      ],
    },
    {
      title: "Da hospedagem, manutenção e suporte",
      paragraphs: [
        "Hospedagem, manutenção evolutiva, monitoramento e suporte após a entrega não estão incluídos neste contrato, salvo se expressamente previstos no escopo.",
        "Tais serviços poderão ser contratados opcionalmente por meio de plano de recorrência da CONTRATADA, com condições, valores e níveis de serviço próprios.",
      ],
    },
    {
      title: "Da rescisão",
      paragraphs: [
        "Este contrato poderá ser rescindido por qualquer das partes mediante comunicação por escrito com antecedência mínima de 15 (quinze) dias, ou imediatamente em caso de descumprimento contratual não sanado em até 10 (dez) dias após notificação.",
        "Em caso de rescisão, serão devidos os valores proporcionais aos serviços efetivamente executados até a data da rescisão. A entrada paga remunera o planejamento e a mobilização inicial e será compensada com os serviços já executados.",
      ],
    },
    {
      title: "Da assinatura eletrônica",
      paragraphs: [
        "As partes reconhecem e concordam que este contrato poderá ser aceito e assinado eletronicamente por meio da plataforma Unitrix Hub, admitindo como válido esse meio de comprovação de autoria e integridade, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001.",
        "A assinatura eletrônica será realizada com registro de evidências — identificação do signatário autenticado, nome completo, CPF ou CNPJ, data e hora, endereço IP, navegador, confirmação de leitura, aceite dos termos e código de integridade (hash) do conteúdo — caracterizando assinatura eletrônica simples ou avançada, conforme o método empregado, nos termos da Lei nº 14.063/2020.",
        "Qualquer alteração posterior do conteúdo exigirá nova versão ou aditivo, com nova assinatura.",
      ],
    },
  ];

  const conditions = (data.conditions ?? "").trim();
  if (conditions) {
    sections.push({ title: "Das condições específicas", paragraphs: conditions.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) });
  }

  sections.push({
    title: "Das disposições gerais e do foro",
    paragraphs: [
      "Este contrato obriga as partes e seus sucessores. A tolerância quanto ao descumprimento de qualquer cláusula não implica renúncia ou novação.",
      "Comunicações entre as partes poderão ser feitas pelo portal do cliente ou pelos e-mails cadastrados.",
      "Fica eleito o foro da comarca da sede da CONTRATADA para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja, ressalvadas as hipóteses legais de competência diversa.",
    ],
  });

  return {
    schema: 1,
    templateId: CONTRACT_TEMPLATE_ID,
    templateName: CONTRACT_TEMPLATE_NAME,
    title: data.title,
    version: data.version,
    generatedAt: new Date().toISOString(),
    parties: { contratada, contratante },
    summary,
    preamble:
      "Pelo presente instrumento particular, as partes abaixo qualificadas celebram este Contrato de Prestação de Serviços de Desenvolvimento, que se regerá pelas cláusulas e condições seguintes.",
    sections: sections.map((s, i) => ({ ...s, number: i + 1 })),
    notice:
      "Este documento é um modelo padronizado da Unitrix e deve ser revisado por assessoria jurídica antes do uso. A plataforma registra evidências técnicas do aceite eletrônico, mas não garante validade jurídica absoluta em todas as circunstâncias.",
  };
}

/** Lê com segurança um snapshot salvo (JSON do banco). */
export function readSnapshot(value: unknown): ContractSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<ContractSnapshot>;
  if (!Array.isArray(v.sections) || !v.parties) return null;
  return v as ContractSnapshot;
}
