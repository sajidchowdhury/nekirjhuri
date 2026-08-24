import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveUpload, UploadError } from "@/lib/upload";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-path";
import { requireRole } from "@/lib/rbac";
import { checkCSRF } from "@/lib/csrf";
import { logAction, getClientIP } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // sharp needs Node, not Edge

/**
 * POST /api/admin/upload
 *
 * Accepts multipart/form-data with a single `file` field (image).
 * Auth-gated: requires a valid admin session (editor+).
 * Validates MIME + size, optimizes with sharp to webp, writes to the
 * persistent upload directory, inserts a UploadedImage row, and returns
 * the public path + metadata.
 *
 * Response (200):
 *   { id, filename, path, mimetype, size, width, height }
 *
 * Errors:
 *   401 — not authenticated
 *   400 — no file / invalid MIME / too large / processing error
 *   500 — unexpected server error
 */
export async function POST(request: Request) {
  const { session, error } = await requireRole("editor");
  if (error) return error;

  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data. Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "কোনো ফাইল পাওয়া যায়নি। 'file' ফিল্ড প্রয়োজন।" },
      { status: 400 }
    );
  }

  try {
    const result = await saveUpload(file, session!.user.id ?? null);

    await logAction({
      userId: session!.user.id,
      userEmail: session!.user.email,
      action: "create",
      resource: "upload",
      resourceId: result.id,
      ip: getClientIP(request),
      details: JSON.stringify({ filename: result.filename, size: result.size }),
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
        maxSize: MAX_UPLOAD_BYTES,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("[upload] unexpected error:", err);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
