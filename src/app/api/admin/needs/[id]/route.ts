import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { needCreateSchema } from "@/lib/validations/need";
import { slugify, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * /api/admin/needs/[id]
 *
 * - GET: fetch a single need by id (auth-gated).
 * - PUT: update a need (auth-gated, zod-validated).
 * - DELETE: delete a need (auth-gated).
 */

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { id } = await params;
  const need = await db.ummahNeed.findUnique({ where: { id } });

  if (!need) {
    return NextResponse.json(
      { error: "প্রয়োজন পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  return NextResponse.json(need);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.ummahNeed.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "প্রয়োজন পাওয়া যায়নি।" },
      { status: 404 }
    );
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

  // If slug changed, ensure uniqueness (excluding self)
  let finalSlug = existing.slug;
  if (data.slug !== undefined && data.slug !== null && data.slug !== "") {
    const candidate = slugify(data.slug);
    if (candidate !== existing.slug) {
      finalSlug = await ensureUniqueSlug(candidate, async (s) => {
        const found = await db.ummahNeed.findFirst({
          where: { slug: s, NOT: { id } },
        });
        return !!found;
      });
    } else {
      finalSlug = candidate;
    }
  }

  const cleaned = {
    title: data.title,
    slug: finalSlug,
    summary: data.summary,
    description: data.description,
    category: data.category,
    location: data.location?.trim() || null,
    targetAmount: data.targetAmount,
    image: data.image?.trim() || null,
    urgency: data.urgency,
    beneficiary: data.beneficiary?.trim() || null,
    status: data.status,
    bKashNumber: data.bKashNumber?.trim() || null,
    bKashType: data.bKashType,
  };

  try {
    const updated = await db.ummahNeed.update({
      where: { id },
      data: cleaned,
    });

    await revalidateHome();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[needs] update error:", err);
    return NextResponse.json(
      { error: "আপডেট করা যায়নি।" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.ummahNeed.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "প্রয়োজন পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  await db.ummahNeed.delete({ where: { id } });

  await revalidateHome();

  return NextResponse.json({ success: true, id });
}
