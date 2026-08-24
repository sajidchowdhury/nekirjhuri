import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { storyCreateSchema } from "@/lib/validations/story";
import { slugify, slugifyOrFallback, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome, revalidateStory } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/** POST — create a story (project). */
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
  const baseSlug = data.slug ? slugify(data.slug) : slugifyOrFallback(data.name);
  const uniqueSlug = await ensureUniqueSlug(baseSlug, async (s) => {
    const existing = await db.project.findUnique({ where: { slug: s } });
    return !!existing;
  });

  try {
    const story = await db.project.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        location: data.location?.trim() || null,
        status: data.status,
        targetAmount: data.targetAmount,
        raisedAmount: data.raisedAmount,
        featuredImage: data.featuredImage?.trim() || null,
        tags: data.tags?.trim() || null,
        published: data.published,
        featured: data.featured,
        authorId: session.user.id,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
      },
    });

    await revalidateHome();
    await revalidateStory(story.slug);

    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    console.error("[stories] create error:", err);
    return NextResponse.json({ error: "তৈরি করা যায়নি।" }, { status: 500 });
  }
}

/** GET — list all stories (admin sees all incl drafts). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const stories = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { updates: true } },
    },
  });

  return NextResponse.json({ stories });
}
