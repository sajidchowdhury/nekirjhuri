import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health
 *
 * Lightweight health check. Verifies:
 * 1. The Next.js server is running and responding.
 * 2. The database connection is alive (simple COUNT query).
 *
 * Used by deploy.sh to verify the app is healthy after restart.
 */
export async function GET() {
  try {
    // Lightweight DB connectivity check — count AdminUsers (fast, small table)
    await db.adminUser.count({ select: { id: true }, take: 1 });

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: err instanceof Error ? err.message : "Unknown database error",
      },
      { status: 503 }
    );
  }
}
