import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/validations/pagination";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/uploads?page=1&pageSize=24
 *
 * Auth-gated. Returns a paginated list of uploaded images, newest first.
 * Used by the ImagePicker's "Library" grid and the media library page.
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

  const [items, total] = await Promise.all([
    db.uploadedImage.findMany({
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
    db.uploadedImage.count(),
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
