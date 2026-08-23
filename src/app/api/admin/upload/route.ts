import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveUpload, UploadError } from "@/lib/upload";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // sharp needs Node, not Edge

/**
 * POST /api/admin/upload
 *
 * Accepts multipart/form-data with a single `file` field (image).
 * Auth-gated: requires a valid admin session.
 * Validates MIME + size, optimizes with sharp to webp, writes to disk,
 * inserts a UploadedImage row, and returns the public path + metadata.
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
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "অননুমোদিত। লগইন করুন।" },
      { status: 401 }
    );
  }

  // 2. Parse multipart form data
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

  // 3. Save + optimize
  try {
    const result = await saveUpload(file, session.user.id ?? null);

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
      const status =
        err.code === "INVALID_MIME" || err.code === "FILE_TOO_LARGE"
          ? 400
          : 400;
      return NextResponse.json({ error: err.message }, { status });
    }

    console.error("[upload] unexpected error:", err);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
