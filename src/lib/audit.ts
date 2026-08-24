import { db } from "@/lib/db";

/**
 * Audit log helper — records admin mutations for security + compliance.
 *
 * Every admin create/update/delete/confirm/reject should call logAction()
 * after a successful operation. Non-blocking (fire-and-forget) so it
 * doesn't slow down the response — if logging fails, the mutation still
 * succeeded.
 *
 * Usage:
 *   await logAction({
 *     userId: session.user.id,
 *     userEmail: session.user.email,
 *     action: "create",
 *     resource: "need",
 *     resourceId: need.id,
 *     ip: getClientIP(request),
 *     details: JSON.stringify({ title: need.title }),
 *   });
 */

export interface AuditEntry {
  userId?: string | null;
  userEmail?: string | null;
  action: string; // create | update | delete | confirm | reject | login | login_failed
  resource: string; // need | module | story | donation | etc.
  resourceId?: string | null;
  ip?: string | null;
  details?: string | null;
}

export async function logAction(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        userEmail: entry.userEmail ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        ip: entry.ip ?? null,
        details: entry.details ?? null,
      },
    });
  } catch (err) {
    // Non-fatal — don't crash the mutation if logging fails
    console.warn("[audit] failed to log action:", err);
  }
}

/** Extract client IP from request headers (handles proxies). */
export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}
