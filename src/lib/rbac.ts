import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Role-based access control (Phase 10.2).
 *
 * Roles:
 *   - super_admin: full access — everything including settings, modules,
 *     user management.
 *   - editor: content-only — needs, donations, stories, projects,
 *     uploads. Cannot access settings, modules, or user management.
 *
 * Usage in an API route handler:
 *   const guard = await requireRole("super_admin", request);
 *   if (guard.error) return guard.error;
 *   // guard.session is the authenticated session
 *
 * Usage in a server component:
 *   const { session, error } = await requireRole("super_admin");
 *   if (error) return <AccessDenied />;
 */

export type AdminRole = "super_admin" | "editor";

/** Resources restricted to super_admin only. Editors cannot access these. */
export const SUPER_ADMIN_ONLY: ReadonlySet<string> = new Set([
  "settings",
  "modules",
  "users",
]);

/** Check if a role is allowed to access a resource. */
export function canAccess(role: string, resource: string): boolean {
  if (role === "super_admin") return true;
  if (role === "editor") return !SUPER_ADMIN_ONLY.has(resource);
  return false;
}

interface RequireRoleResult {
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> | null;
  error: NextResponse | null;
}

/**
 * Require a specific role for an API route. Returns {session, error}.
 * If error is non-null, return it immediately from the handler.
 *
 * @param role — minimum role required ("super_admin" or "editor")
 * @param request — optional Request (for audit IP extraction)
 */
export async function requireRole(
  role: AdminRole,
  request?: Request
): Promise<RequireRoleResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "অননুমোদিত। লগইন করুন।" },
        { status: 401 }
      ),
    };
  }

  const userRole = session.user.role;

  // super_admin can always pass
  if (userRole === "super_admin") {
    return { session, error: null };
  }

  // If we require super_admin but user is editor, deny
  if (role === "super_admin" && userRole !== "super_admin") {
    return {
      session,
      error: NextResponse.json(
        { error: "এই কাজের জন্য সুপার অ্যাডমিন অনুমতি প্রয়োজন।" },
        { status: 403 }
      ),
    };
  }

  // role === "editor" — both super_admin and editor can pass
  return { session, error: null };
}
