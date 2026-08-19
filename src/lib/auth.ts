// ═══════════ auth.ts — COMPLETO (Server Components / API Routes) ═══════════
// Importa bcryptjs (JS puro, sem binário nativo) e Prisma.
// NÃO importado pelo middleware.
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 1. Admin (User)
        const admin = await prisma.user.findUnique({ where: { email } });
        if (admin && admin.passwordHash) {
          const valid = await bcrypt.compare(password, admin.passwordHash);
          if (valid) {
            return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
          }
        }

        // 2. Cliente
        const client = await prisma.client.findUnique({ where: { email } });
        if (client && client.passwordHash) {
          const valid = await bcrypt.compare(password, client.passwordHash);
          if (valid) {
            return { id: client.id, email: client.email, name: client.name, role: "CLIENT" };
          }
        }

        return null;
      },
    }),
  ],
});
