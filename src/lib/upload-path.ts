/**
 * Upload path builder — centralizes where uploaded files live on disk.
 *
 * Layout: public/uploads/<yyyy>/<mm>/<uuid>.<ext>
 *   e.g. public/uploads/2025/01/a1b2c3d4-....webp
 *
 * The public URL path is the filesystem path with the leading "public/"
 * stripped, so the browser can fetch it at /uploads/2025/01/....webp
 *
 * Phase 2's upload service (src/lib/upload.ts + /api/admin/upload) will use
 * these helpers. They're provided now so the path format is consistent from
 * day one and easy to swap to S3 later (only this file changes).
 */

import { randomUUID } from "node:crypto";
import { extname } from "node:path";

/** Allowed upload MIME types and their canonical extensions. */
export const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Max upload size in bytes (5 MB). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface UploadPathResult {
  /** Filesystem-absolute path, e.g. /var/www/app/public/uploads/2025/01/abc.webp */
  fsPath: string;
  /** Public URL path (no leading "public/"), e.g. /uploads/2025/01/abc.webp */
  publicPath: string;
  /** The generated filename, e.g. abc-uuid.webp */
  filename: string;
  /** The directory containing the file (fs-absolute). */
  dir: string;
  /** The year-month subfolder, e.g. 2025/01 */
  subfolder: string;
  /** Canonical extension (no leading dot), e.g. webp */
  ext: string;
  /** The mime type used to derive the extension. */
  mime: string;
}

/**
 * Decide whether a MIME type is allowed for uploads.
 */
export function isAllowedMime(mime: string): boolean {
  return Object.prototype.hasOwnProperty.call(ALLOWED_MIME, mime);
}

/**
 * Build an upload path for a new file.
 *
 * @param mime       The file's MIME type (must be in ALLOWED_MIME).
 * @param projectRoot  Absolute path to the project root (where `public/` lives).
 *                     In Next.js server code, pass `process.cwd()`.
 * @param date        The date to file the upload under (default: now).
 * @param uuid        Override the UUID (mainly for tests); defaults to randomUUID().
 * @throws if the MIME type is not allowed.
 */
export function buildUploadPath(
  mime: string,
  projectRoot: string = process.cwd(),
  date: Date = new Date(),
  uuid: string = randomUUID()
): UploadPathResult {
  if (!isAllowedMime(mime)) {
    throw new Error(
      `Unsupported upload MIME type: "${mime}". Allowed: ${Object.keys(ALLOWED_MIME).join(", ")}`
    );
  }

  const ext = ALLOWED_MIME[mime];
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const subfolder = `${yyyy}/${mm}`;
  const filename = `${uuid}.${ext}`;

  const dir = `${projectRoot}/public/uploads/${subfolder}`;
  const fsPath = `${dir}/${filename}`;
  const publicPath = `/uploads/${subfolder}/${filename}`;

  return { fsPath, publicPath, filename, dir, subfolder, ext, mime };
}

/**
 * Extract a file extension from a filename, lowercased, without the dot.
 * Returns "" if none. Used for display/audit only — actual uploads use the
 * MIME-derived extension from buildUploadPath() for security.
 */
export function extensionFromFilename(filename: string): string {
  return extname(filename).replace(/^\./, "").toLowerCase();
}
