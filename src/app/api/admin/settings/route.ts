import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/settings";
import { siteSettingsSchema, SETTINGS_SINGLETON_ID } from "@/lib/validations/settings";
import { revalidateHome } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 *
 * Auth-gated. Returns the singleton SiteSettings row (creates an empty
 * one on first access if it doesn't exist).
 *
 * Response (200): { id, phone, altPhone, email, address, facebook,
 *   youtube, instagram, twitter, whatsapp, telegram, mapEmbed, updatedAt }
 *
 * Errors: 401 — not authenticated
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

/**
 * PUT /api/admin/settings
 *
 * Auth-gated. Updates the singleton SiteSettings row. Validates the
 * entire body with zod — returns 422 with field-level errors if invalid.
 * After a successful update, revalidates the public home page so the
 * footer + donate CTA reflect the new contact/social info immediately.
 *
 * Response (200): the updated settings row (same shape as GET).
 *
 * Errors:
 *   401 — not authenticated
 *   422 — validation error (returns { error, fields: {field: message} })
 *   500 — unexpected server error
 */
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  // 1. Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "অগ্রহণযোগ্য JSON বডি।" },
      { status: 400 }
    );
  }

  // 2. Validate with zod
  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    // Flatten zod errors into { field: message }
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      { error: "ভ্যালিডেশন ত্রুটি।", fields },
      { status: 422 }
    );
  }

  // 3. Coerce empty strings → null (so DB stores NULL, not "")
  const data: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    data[k] = typeof v === "string" && v.trim() === "" ? null : (v as string | null);
  }

  // 4. Upsert (in case the singleton row doesn't exist yet)
  const updated = await db.siteSettings.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: data,
    create: { id: SETTINGS_SINGLETON_ID, ...data },
  });

  // 5. Revalidate the public home page (footer + donate CTA read settings)
  await revalidateHome();

  return NextResponse.json(updated);
}
