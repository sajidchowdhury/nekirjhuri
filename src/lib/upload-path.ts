/**
 * Upload path builder — centralizes where uploaded files live on disk.
 *
 * Production (standalone mode):
 *   Files are stored in a PERSISTENT directory that survives rebuilds.
 *   Set UPLOAD_DIR env var (e.g. /var/www/nekirjhuri.com/uploads).
 *   If not set, defaults to <cwd>/uploads/ (sibling to .next/standalone).
 *
 * Development:
 *   Files are stored in <cwd>/public/uploads/ so the Next.js dev server
 *   can serve them directly as static files.
 *
 * The public URL path is always /uploads/<yyyy>/<mm>/<uuid>.<ext>.
 * A catch-all route at /uploads/[...path] serves files from the
 * persistent directory in production (when the dev server isn't
 * available to serve static files from public/).
 */

import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";

/** Allowed upload MIME types and their canonical extensions. */
export const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Max upload size in bytes (5 MB). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface UploadPathResult {
  /** Filesystem-absolute path to the file. */
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
 * Get the base upload directory (persistent across builds).
 * - Production: UPLOAD_DIR env var, or <cwd>/uploads/
 * - Development: <cwd>/public/uploads/
 */
export function getUploadBaseDir(): string {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  if (process.env.NODE_ENV === "production") {
    return join(process.cwd(), "uploads");
  }
  return join(process.cwd(), "public", "uploads");
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
 * @param _projectRoot  Unused — kept for backward compat. Upload dir is
 *                      determined by getUploadBaseDir().
 * @param date        The date to file the upload under (default: now).
 * @param uuid        Override the UUID (mainly for tests); defaults to randomUUID().
 * @throws if the MIME type is not allowed.
 */
export function buildUploadPath(
  mime: string,
  _projectRoot: string = "",
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

  const baseDir = getUploadBaseDir();
  const dir = join(baseDir, subfolder);
  const fsPath = join(dir, filename);
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
