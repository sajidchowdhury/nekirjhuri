import { NextResponse } from "next/server";
import { getOrCreateSettings } from "@/lib/settings";

/**
 * GET /api/settings
 *
 * PUBLIC endpoint (no auth). Returns the singleton SiteSettings row.
 * Used by client-side components that need contact/social info.
 *
 * Server components should call getOrCreateSettings() directly (avoids
 * an extra HTTP round-trip). This endpoint is for client-side use only.
 *
 * Cache: s-maxage=60 (CDN caches for 60s), stale-while-revalidate=600
 * (serves stale for up to 10min while fetching fresh).
 */
export async function GET() {
  const settings = await getOrCreateSettings();

  // Set cache headers for public consumption
  const res = NextResponse.json(settings);
  res.headers.set(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=600"
  );
  return res;
}
