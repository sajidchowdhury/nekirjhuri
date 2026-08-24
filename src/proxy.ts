import { withAuth } from "next-auth/middleware";

/**
 * Middleware guard for the admin panel.
 *
 * Protects every /admin/* route except /admin/login itself.
 * Uses NextAuth's withAuth — it checks for a valid JWT session token.
 * If absent, redirects to /admin/login (configured in authOptions.pages).
 *
 * The matcher uses a negative lookahead to exclude /admin/login:
 *   /admin/((?!login).*)  →  matches /admin, /admin/modules, etc.
 *                            but NOT /admin/login
 *
 * Note: middleware runs in the Edge runtime, so it cannot use Prisma.
 * It only checks token presence. Full session validation (DB lookup)
 * happens during login (authorize callback) and in the admin layout
 * (getServerSession). This is defense in depth.
 */
export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
