import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * NextAuth configuration for the নেকির ঝুড়ি admin panel.
 *
 * - Credentials provider validates email + password against the AdminUser table.
 * - JWT session strategy (stateless — works on standalone serverless-ish deploys).
 * - The JWT carries: sub (user id), email, name, role.
 * - Session callback exposes `role` to the client via the session token.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "ইমেইল", type: "email" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.adminUser.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // No user found, or account deactivated
        if (!user || !user.isActive) {
          return null;
        }

        // Constant-time password comparison
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          return null;
        }

        // Update last login timestamp (non-blocking — don't fail login on this)
        db.adminUser
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            /* ignore — login should still succeed */
          });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    // JWT is stateless — no session DB rows needed
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` is the object returned from authorize()
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "editor";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id + role to the client session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "editor";
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  // NEXTAUTH_SECRET must be set in .env (production: a strong random string)
  secret: process.env.NEXTAUTH_SECRET,
};
