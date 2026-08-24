/**
 * Simple in-memory rate limiter (no Redis dependency).
 *
 * For production with multiple server instances, replace with Redis-based
 * rate limiting. For single-server deploys, this is sufficient.
 *
 * Usage:
 *   const result = rateLimit({ key: `login:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
 *   if (!result.allowed) {
 *     return NextResponse.json({ error: "অনেকবার চেষ্টা করেছেন। ১৫ মিনিট পর আবার চেষ্টা করুন।" }, { status: 429 });
 *   }
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();
  const now = Date.now();
  const existing = store.get(opts.key);

  if (!existing || existing.resetAt < now) {
    // First request or window expired
    const entry: RateLimitEntry = { count: 1, resetAt: now + opts.windowMs };
    store.set(opts.key, entry);
    return { allowed: true, remaining: opts.limit - 1, resetAt: entry.resetAt };
  }

  if (existing.count >= opts.limit) {
    // Rate limited
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  // Increment
  existing.count += 1;
  return {
    allowed: true,
    remaining: opts.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Convenience: rate limit for login attempts (5 per 15 min per IP). */
export function checkLoginRateLimit(ip: string | null): {
  allowed: boolean;
  remaining: number;
} {
  const key = `login:${ip ?? "unknown"}`;
  const result = rateLimit({
    key,
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  });
  return { allowed: result.allowed, remaining: result.remaining };
}
