import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { storyCreateSchema } from "@/lib/validations/story";
import { slugify, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome, revalidateStory } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

/** GET — single story by id (with updates). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const story = await db.project.findUnique({
    where: { id },
    include: {
      updates: { orderBy: { date: "asc" } },
    },
  });

  if (!story) return NextResponse.json({ error: "গল্প পাওয়া যায়নি।" }, { status: 404 });
  return NextResponse.json(story);
}

/** PUT — update story. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "গল্প পাওয়া যায়নি।" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = storyCreateSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "ভ্যালিডেশন ত্রুটি।", fields }, { status: 422 });
  }

  const data = parsed.data;
  let finalSlug = existing.slug;
  if (data.slug) {
    const candidate = slugify(data.slug);
    if (candidate !== existing.slug) {
      finalSlug = await ensureUniqueSlug(candidate, async (s) => {
        const found = await db.project.findFirst({ where: { slug: s, NOT: { id } } });
        return !!found;
      });
    } else {
      finalSlug = candidate;
    }
  }

  try {
    const updated = await db.project.update({
      where: { id },
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description,
        location: data.location?.trim() || null,
        status: data.status,
        targetAmount: data.targetAmount,
        raisedAmount: data.raisedAmount,
        featuredImage: data.featuredImage?.trim() || null,
        tags: data.tags?.trim() || null,
        published: data.published,
        featured: data.featured,
        startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
      },
    });

    await revalidateHome();
    await revalidateStory(updated.slug);
    if (existing.slug !== updated.slug) await revalidateStory(existing.slug);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[stories] update error:", err);
    return NextResponse.json({ error: "আপডেট করা যায়নি।" }, { status: 500 });
  }
}

/** DELETE — delete story (cascades to updates). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "গল্প পাওয়া যায়নি।" }, { status: 404 });

  await db.project.delete({ where: { id } });

  await revalidateHome();
  await revalidateStory(existing.slug);

  return NextResponse.json({ success: true, id });
}
