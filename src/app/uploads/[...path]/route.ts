import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { getUploadBaseDir } from "@/lib/upload-path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

/**
 * GET /uploads/[...path]
 *
 * Serves uploaded files from the persistent upload directory.
 * In development, the Next.js dev server serves these directly from
 * public/uploads/ as static files, so this route is only reached in
 * production standalone mode where the files live outside .next/standalone.
 *
 * The upload directory is determined by getUploadBaseDir():
 *   - UPLOAD_DIR env var (production recommended)
 *   - <cwd>/uploads/ (production default)
 *   - <cwd>/public/uploads/ (development)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Security: prevent path traversal — only allow alphanumeric, hyphens,
  // underscores, and forward slashes in the path segments.
  const safeSegments = segments.every((s) =>
    /^[a-zA-Z0-9\-_]+$/.test(s)
  );

  if (!safeSegments) {
    return new Response("Not found", { status: 404 });
  }

  const baseDir = getUploadBaseDir();
  const filePath = join(baseDir, ...segments);

  // Security: ensure the resolved path is within the upload directory
  if (!filePath.startsWith(baseDir)) {
    return new Response("Not found", { status: 404 });
  }

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileBuffer = await readFile(filePath);

    // Determine content type from extension
    const ext = segments[segments.length - 1]?.split(".").pop() ?? "";
    const contentType = CONTENT_TYPES[`.${ext}`] ?? "application/octet-stream";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
