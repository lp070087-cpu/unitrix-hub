import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ConditionalUI } from "@/components/layout/conditional-ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unitrix Hub",
  description: "Plataforma premium de relacionamento comercial",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <ConditionalUI />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
