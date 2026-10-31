import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ConditionalUI } from "@/components/layout/conditional-ui";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unitrix-hub.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Unitrix — Tecnologia sob medida", template: "%s · Unitrix" },
  description: "Desenvolvemos websites, plataformas, sistemas inteligentes e experiências digitais que transformam ideias em soluções reais.",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Unitrix" },
};

export const viewport: Viewport = { themeColor: "#101114", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <ConditionalUI />
        {children}
      </body>
    </html>
  );
}
