import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlinkSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/admin/uploads/[id]
 *
 * Auth-gated. Soft-deletes an uploaded image:
 *   1. Marks deletedAt = now() (keeps the row for audit/history).
 *   2. Removes the actual file from disk (public/uploads/.../<uuid>.webp).
 *
 * The row is kept so references in content (e.g. a Need's `image` field)
 * don't break immediately — but the file is gone, so broken images would
 * show. In a future phase, an orphan-cleanup job can hard-delete rows
 * that have been soft-deleted for >30 days AND aren't referenced.
 *
 * Response (200):
 *   { success: true, id, deletedAt }
 *
 * Errors:
 *   401 — not authenticated
 *   404 — image not found (or already deleted)
 *   500 — file system error (row still soft-deleted)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { id } = await params;

  const image = await db.uploadedImage.findUnique({ where: { id } });

  if (!image || image.deletedAt) {
    return NextResponse.json(
      { error: "ছবি পাওয়া যায়নি বা ইতিমধ্যে মুছে ফেলা হয়েছে।" },
      { status: 404 }
    );
  }

  // 1. Soft-delete the row first (so even if file deletion fails, the row
  //    is marked as deleted and won't appear in the library).
  const now = new Date();
  await db.uploadedImage.update({
    where: { id },
    data: { deletedAt: now },
  });

  // 2. Try to remove the file from disk. If it fails, log but don't fail
  //    the request — the row is already soft-deleted.
  try {
    // path is like "/uploads/2025/01/uuid.webp" — map to filesystem
    const fsPath = join(process.cwd(), "public", image.path);
    unlinkSync(fsPath);
  } catch (err) {
    console.warn(
      `[uploads] failed to delete file ${image.path}:`,
      err instanceof Error ? err.message : err
    );
    // Non-fatal — row is already soft-deleted.
  }

  return NextResponse.json({
    success: true,
    id,
    deletedAt: now.toISOString(),
  });
}
