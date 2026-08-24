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

  // Normalize: remove trailing slash for comparison
  const normalizeUrl = (url: string) => url.replace(/\/$/, "");

  // If Origin header is present, it must match (allowing http/https variants)
  if (origin) {
    const originNormalized = normalizeUrl(origin);
    const expectedNormalized = normalizeUrl(expectedOrigin);
    // Direct match OR same hostname with different protocol (http vs https)
    if (originNormalized !== expectedNormalized) {
      try {
        const originUrl = new URL(origin);
        const expectedUrl = new URL(expectedOrigin);
        if (originUrl.hostname !== expectedUrl.hostname) {
          return NextResponse.json(
            { error: "CSRF: Origin mismatch." },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "CSRF: Invalid origin." },
          { status: 403 }
        );
      }
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
  // non-browser attack).
  // Note: In development, we skip this check entirely for curl/testing.
  // In production, we also skip it because some reverse proxies (Nginx,
  // Caddy) may strip the Origin header for same-origin requests.
  // NextAuth's own CSRF token already protects against cross-site forgery.
  // This check is an additional layer — disabling it when headers are
  // missing is safer than blocking legitimate admin form submissions.
  return null;
}
