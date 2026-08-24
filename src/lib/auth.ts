import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { logAction } from "@/lib/audit";
import { BCRYPT_COST } from "@/lib/password";

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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limit: 5 attempts per 15 min per IP
        const forwarded = req?.headers?.get?.("x-forwarded-for");
        const ip = forwarded
          ? forwarded.split(",")[0].trim()
          : req?.headers?.get?.("x-real-ip")?.trim() ?? "unknown";
        const rateLimitResult = checkLoginRateLimit(ip);
        if (!rateLimitResult.allowed) {
          return null; // silently reject — don't reveal rate limiting to attacker
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await db.adminUser.findUnique({
          where: { email },
        });

        // No user found, or account deactivated
        if (!user || !user.isActive) {
          await logAction({
            userEmail: email,
            action: "login_failed",
            resource: "user",
            ip,
            details: JSON.stringify({ reason: "no_user_or_inactive" }),
          });
          return null;
        }

        // Constant-time password comparison
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          await logAction({
            userId: user.id,
            userEmail: user.email,
            action: "login_failed",
            resource: "user",
            ip,
            details: JSON.stringify({ reason: "wrong_password" }),
          });
          return null;
        }

        // Update last login timestamp (non-blocking)
        db.adminUser
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            /* ignore */
          });

        // Audit: successful login
        await logAction({
          userId: user.id,
          userEmail: user.email,
          action: "login",
          resource: "user",
          resourceId: user.id,
          ip,
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
