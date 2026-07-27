import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

const isEdge = process.env.NEXT_RUNTIME === "edge";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  ...(isEdge ? {} : { adapter: DrizzleAdapter(db) }),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (isEdge) return null;

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

