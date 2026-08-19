// ═══════════ middleware.ts — EDGE COMPATIBLE ═══════════
// Importa APENAS auth.config.ts (sem bcrypt, Prisma, ou módulos nativos)
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
