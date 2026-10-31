// auth.config.ts — compatível com Edge (usado pelo middleware). Sem Prisma/bcrypt.
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/auth/login" },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      if (pathname.startsWith("/auth")) {
        if (isLoggedIn && (role === "ADMIN" || role === "CLIENT")) {
          return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/cliente", nextUrl));
        }
        return true;
      }
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (role !== "ADMIN") return Response.redirect(new URL(role === "CLIENT" ? "/cliente" : "/auth/login", nextUrl));
        return true;
      }
      if (pathname.startsWith("/cliente")) {
        if (!isLoggedIn) return false;
        if (role === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
        if (role !== "CLIENT") return false;
        return true;
      }
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
        session.user.role = (token.role as string) || "";
        session.user.id = (token.id as string) || "";
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [],
} satisfies NextAuthConfig;
