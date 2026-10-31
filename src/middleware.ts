// middleware.ts — Edge. Importa apenas auth.config.ts.
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protege apenas áreas autenticadas; o resto (site, documentos públicos, APIs) valida no servidor.
  matcher: ["/admin/:path*", "/cliente/:path*", "/auth/:path*"],
};
