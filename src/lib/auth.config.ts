// ═══════════ auth.config.ts — EDGE COMPATIBLE ═══════════
// NÃO importa bcrypt, Prisma, ou qualquer módulo nativo.
// Usado pelo middleware (Edge Runtime).
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      // API routes — allow
      if (pathname.startsWith("/api/auth")) return true;

      // Auth pages — redirect to dashboard if logged in
      if (pathname.startsWith("/auth")) {
        if (isLoggedIn) {
          return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/cliente", nextUrl));
        }
        return true;
      }

      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (role !== "ADMIN") return Response.redirect(new URL("/cliente", nextUrl));
        return true;
      }

      // Client routes
      if (pathname.startsWith("/cliente")) {
        if (!isLoggedIn) return false;
        return true;
      }

      // Everything else (landing, public pages) — allow
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "CLIENT";
        session.user.id = (token.id as string) || "";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // populated in auth.ts
} satisfies NextAuthConfig;
