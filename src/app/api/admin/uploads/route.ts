import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/validations/pagination";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/uploads?page=1&pageSize=24&q=searchterm
 *
 * Auth-gated. Returns a paginated list of ACTIVE (non-deleted) uploaded
 * images, newest first. Supports optional filename search via ?q=.
 *
 * Used by:
 *   - ImagePicker's "Library" grid (Phase 2.2)
 *   - Media library page (Phase 2.3)
 *
 * Response (200):
 *   { items: [{id, filename, path, mimetype, size, width, height, createdAt}],
 *     meta: {page, pageSize, total, totalPages, hasPrev, hasNext} }
 *
 * Errors:
 *   401 — not authenticated
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = parsePagination({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 24,
  });
  const q = (searchParams.get("q") || "").trim();

  // Active filter: deletedAt IS NULL. Optional search by filename (contains).
  const where = {
    deletedAt: null,
    ...(q ? { filename: { contains: q } } : {}),
  };

  const [items, total] = await Promise.all([
    db.uploadedImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: parsed.skip,
      take: parsed.take,
      select: {
        id: true,
        filename: true,
        path: true,
        mimetype: true,
        size: true,
        width: true,
        height: true,
        createdAt: true,
      },
    }),
    db.uploadedImage.count({ where }),
  ]);

  return NextResponse.json({
    items,
    meta: {
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
      hasPrev: parsed.page > 1,
      hasNext: parsed.page < Math.ceil(total / parsed.pageSize),
    },
  });
}
