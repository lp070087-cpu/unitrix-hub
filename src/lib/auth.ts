// auth.ts — completo (Server Components / Route Handlers / Server Actions). Não importado pelo middleware.
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const credsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(1).max(200),
});

// Hash fixo para equalizar o tempo de resposta quando o e-mail não existe (evita enumeração por timing).
const DUMMY_HASH = "$2a$12$1J/s30yVDN.l6tPBNa8TMOEp2.iVSgf3wbvXRIu7aa1gwMtF8Vi8W";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Senha", type: "password" } },
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const admin = await prisma.user.findUnique({ where: { email } });
        if (admin?.passwordHash) {
          if (await bcrypt.compare(password, admin.passwordHash)) {
            return { id: admin.id, email: admin.email, name: admin.name, role: admin.role === "ADMIN" ? "ADMIN" : "CLIENT_DENIED" };
          }
          return null;
        }

        const client = await prisma.client.findUnique({ where: { email } });
        if (client?.passwordHash) {
          if (await bcrypt.compare(password, client.passwordHash)) {
            return { id: client.id, email: client.email, name: client.name, role: "CLIENT" };
          }
          return null;
        }

        await bcrypt.compare(password, DUMMY_HASH);
        return null;
      },
    }),
  ],
});
