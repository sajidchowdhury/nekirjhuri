import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  buildUploadPath,
  isAllowedMime,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload-path";

export interface SaveUploadResult {
  /** DB row id */
  id: string;
  /** Original filename (for display) */
  filename: string;
  /** Public URL path, e.g. /uploads/2025/01/uuid.webp */
  path: string;
  /** Original MIME type (e.g. image/png) — the file on disk is always webp */
  mimetype: string;
  /** File size in bytes (after optimization) */
  size: number;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_MIME"
      | "FILE_TOO_LARGE"
      | "EMPTY_FILE"
      | "PROCESSING_FAILED"
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Save an uploaded image file.
 *
 * Pipeline:
 * 1. Validate the MIME type is in the allowlist (png/jpeg/webp).
 * 2. Validate the size is under MAX_UPLOAD_BYTES.
 * 3. Generate a path: <upload-dir>/<yyyy>/<mm>/<uuid>.webp
 * 4. Optimize with sharp: resize to max 1600px wide, convert to webp q80.
 * 5. Write the optimized buffer to disk.
 * 6. Insert an UploadedImage row (with original mime for audit).
 * 7. Return metadata.
 *
 * @param file       The File/Blob from FormData.
 * @param userId     The AdminUser id of the uploader (null if unknown).
 */
export async function saveUpload(
  file: File,
  userId: string | null
): Promise<SaveUploadResult> {
  // 1. Validate MIME
  const mime = file.type;
  if (!isAllowedMime(mime)) {
    throw new UploadError(
      `Unsupported file type: "${mime}". Allowed: image/png, image/jpeg, image/webp.`,
      "INVALID_MIME"
    );
  }

  // 2. Validate size
  if (file.size === 0) {
    throw new UploadError("File is empty.", "EMPTY_FILE");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `File is too large (${file.size} bytes). Max ${MAX_UPLOAD_BYTES} bytes (5 MB).`,
      "FILE_TOO_LARGE"
    );
  }

  // 3. Read the file into a buffer
  const arrayBuffer = await file.arrayBuffer();
  const originalBuffer = Buffer.from(arrayBuffer);

  // 4. Generate the storage path — always .webp since we optimize
  const date = new Date();
  const uuid = randomUUID();
  const uploadPath = buildUploadPath("image/webp", "", date, uuid);

  // 5. Optimize with sharp
  let optimizedBuffer: Buffer;
  let width: number;
  let height: number;

  try {
    const meta = await sharp(originalBuffer).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;

    const transformer = sharp(originalBuffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside", // never upscale, never crop
        withoutEnlargement: true,
      })
      .webp({ quality: 80 });

    optimizedBuffer = await transformer.toBuffer();

    // Get final dimensions after resize
    const finalMeta = await sharp(optimizedBuffer).metadata();
    width = finalMeta.width ?? width;
    height = finalMeta.height ?? height;
  } catch (err) {
    throw new UploadError(
      `Image processing failed: ${
        err instanceof Error ? err.message : "unknown error"
      }`,
      "PROCESSING_FAILED"
    );
  }

  // 6. Ensure the directory exists + write the file
  try {
    mkdirSync(uploadPath.dir, { recursive: true });
    writeFileSync(uploadPath.fsPath, optimizedBuffer);
  } catch (err) {
    throw new UploadError(
      `Failed to write file to disk: ${
        err instanceof Error ? err.message : "unknown error"
      }`,
      "PROCESSING_FAILED"
    );
  }

  // 7. Insert the DB row
  const originalFilename = file.name || `${uuid}.${uploadPath.ext}`;
  const row = await db.uploadedImage.create({
    data: {
      filename: originalFilename,
      path: uploadPath.publicPath,
      mimetype: mime, // store ORIGINAL mime; file on disk is webp
      size: optimizedBuffer.length,
      width,
      height,
      uploadedById: userId,
    },
  });

  return {
    id: row.id,
    filename: row.filename,
    path: row.path,
    mimetype: row.mimetype,
    size: row.size,
    width: row.width,
    height: row.height,
  };
}
