import { NextResponse } from "next/server";

/**
 * CSRF protection for admin mutation routes (Phase 10.1).
 *
 * NextAuth already protects its own endpoints with CSRF tokens. For
 * admin API routes (POST/PUT/PATCH/DELETE), we add an additional check:
 * the request must come from the same origin (checked via Origin or
 * Referer header). This prevents cross-site request forgery.
 *
 * Usage at the top of any admin mutation handler:
 *   const csrfError = checkCSRF(request);
 *   if (csrfError) return csrfError;
 */

/** Check that the request Origin/Referer matches the expected origin. */
export function checkCSRF(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  // Only check state-changing methods
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expectedOrigin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // If Origin header is present, it must match
  if (origin) {
    if (origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "CSRF: Origin mismatch." },
        { status: 403 }
      );
    }
    return null;
  }

  // Fall back to Referer header if Origin is absent
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const expectedUrl = new URL(expectedOrigin);
      if (refererUrl.origin !== expectedUrl.origin) {
        return NextResponse.json(
          { error: "CSRF: Referer origin mismatch." },
          { status: 403 }
        );
      }
      return null;
    } catch {
      // Invalid referer URL — block
      return NextResponse.json(
        { error: "CSRF: Invalid referer." },
        { status: 403 }
      );
    }
  }

  // No Origin or Referer header — for same-origin browser requests, at
  // least one is always present. Block if neither exists (could be a
  // non-browser attack). Note: this may affect API testing tools like
  // curl, so we only enforce in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CSRF: Missing origin header." },
      { status: 403 }
    );
  }

  return null;
}
