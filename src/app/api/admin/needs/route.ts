import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { needCreateSchema } from "@/lib/validations/need";
import { slugify, slugifyOrFallback, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/needs
 *
 * Auth-gated. Creates a new Ummah need. Validates with zod.
 * Auto-generates a slug from the title if not provided; ensures uniqueness.
 *
 * Response (201): the created need.
 * Errors: 401, 422, 500.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = needCreateSchema.safeParse(body);
  if (!parsed.success) {
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

  const data = parsed.data;

  // Resolve slug
  const baseSlug = data.slug
    ? slugify(data.slug)
    : slugifyOrFallback(data.title);
  const uniqueSlug = await ensureUniqueSlug(baseSlug, async (s) => {
    const existing = await db.ummahNeed.findUnique({ where: { slug: s } });
    return !!existing;
  });

  // Coerce empty strings → null
  const cleaned = {
    ...data,
    slug: uniqueSlug,
    location: data.location?.trim() || null,
    image: data.image?.trim() || null,
    beneficiary: data.beneficiary?.trim() || null,
    bKashNumber: data.bKashNumber?.trim() || null,
  };

  try {
    const need = await db.ummahNeed.create({
      data: {
        title: cleaned.title,
        slug: cleaned.slug,
        summary: cleaned.summary,
        description: cleaned.description,
        category: cleaned.category,
        location: cleaned.location,
        targetAmount: cleaned.targetAmount,
        image: cleaned.image,
        urgency: cleaned.urgency,
        beneficiary: cleaned.beneficiary,
        status: cleaned.status,
        bKashNumber: cleaned.bKashNumber,
        bKashType: cleaned.bKashType,
        // raisedAmount + donorCount default to 0; Phase 6 will update them
      },
    });

    await revalidateHome();

    return NextResponse.json(need, { status: 201 });
  } catch (err) {
    console.error("[needs] create error:", err);
    return NextResponse.json(
      { error: "তৈরি করা যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/needs
 *
 * Auth-gated. Returns ALL needs (including funded/closed), with optional
 * query filters: ?status=active&category=madrasa&urgency=critical&q=search
 *
 * Used by the admin list page. (Public /api/needs only returns active ones.)
 *
 * Response (200): { needs: [...] }
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const urgency = searchParams.get("urgency");
  const q = (searchParams.get("q") || "").trim();

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (urgency) where.urgency = urgency;
  if (q) where.title = { contains: q };

  const needs = await db.ummahNeed.findMany({
    where,
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ needs });
}
