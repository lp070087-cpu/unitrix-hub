/**
 * Configuração do site público da Unitrix.
 *
 * ── CONTATOS ────────────────────────────────────────────────────────────────
 * Lidos de variáveis de ambiente públicas. Um contato só aparece no site se a
 * variável correspondente estiver definida (nada é inventado):
 *   NEXT_PUBLIC_CONTACT_EMAIL     ex.: contato@seudominio.com
 *   NEXT_PUBLIC_CONTACT_WHATSAPP  ex.: 5511999999999 (apenas dígitos, com DDI)
 *   NEXT_PUBLIC_INSTAGRAM_URL     ex.: https://instagram.com/perfil
 *
 * ── PORTFÓLIO ───────────────────────────────────────────────────────────────
 * Adicione apenas projetos reais e autorizados pelo cliente. Enquanto a lista
 * estiver vazia, a seção exibe o bloco "Portfólio em curadoria".
 * Para adicionar um case, inclua um objeto em `portfolio`:
 *
 *   {
 *     name: "Nome do projeto",
 *     category: "E-commerce",
 *     description: "Uma ou duas frases sobre o desafio e a solução.",
 *     image: "/portfolio/nome-do-projeto.webp", // opcional — coloque em /public/portfolio
 *     url: "https://projeto.com.br",            // opcional
 *   }
 *
 * Use imagens otimizadas (webp/avif, ~1600px de largura, proporção 16:10).
 */

export type PortfolioItem = {
  name: string;
  category: string;
  description: string;
  image?: string;
  url?: string;
};

export const portfolio: PortfolioItem[] = [];

function clean(v: string | undefined) {
  const s = (v || "").trim();
  return s.length ? s : undefined;
}

const whatsappDigits = clean(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP)?.replace(/\D/g, "");

export const siteConfig = {
  name: "Unitrix",
  tagline: "Premium Technology Studio",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://unitrix-hub.vercel.app",
  description:
    "Desenvolvemos websites, plataformas, sistemas inteligentes e experiências digitais que transformam ideias em soluções reais.",
  contact: {
    email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    whatsapp: whatsappDigits && whatsappDigits.length >= 10 ? whatsappDigits : undefined,
    whatsappUrl: whatsappDigits && whatsappDigits.length >= 10 ? `https://wa.me/${whatsappDigits}` : undefined,
    instagram: clean(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  },
  nav: [
    { href: "#servicos", label: "Serviços" },
    { href: "#portfolio", label: "Portfólio" },
    { href: "#processo", label: "Processo" },
    { href: "#hub", label: "Unitrix Hub" },
    { href: "#faq", label: "FAQ" },
  ],
} as const;

/** Formata dígitos de WhatsApp para exibição (+55 11 99999-9999). */
export function formatWhatsapp(digits: string) {
  const d = digits.replace(/\D/g, "");
  const m = d.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  if (!m) return `+${d}`;
  return `+${m[1]} ${m[2]} ${m[3]}-${m[4]}`;
}
