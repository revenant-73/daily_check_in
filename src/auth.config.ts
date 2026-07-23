import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    // We'll add the full Credentials logic in the main auth.ts 
    // to keep this file purely config-based if needed, 
    // or just leave the definition here.
    Credentials({}), 
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "player";
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
