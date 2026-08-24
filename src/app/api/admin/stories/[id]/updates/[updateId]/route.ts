import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateCreateSchema } from "@/lib/validations/story";
import { revalidateHome, revalidateStory } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

async function getStorySlug(projectId: string): Promise<string | null> {
  const p = await db.project.findUnique({ where: { id: projectId }, select: { slug: true } });
  return p?.slug ?? null;
}

/** PUT — update a timeline entry. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { updateId } = await params;
  const existing = await db.projectUpdate.findUnique({ where: { id: updateId } });
  if (!existing) return NextResponse.json({ error: "আপডেট পাওয়া যায়নি।" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = updateCreateSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "ভ্যালিডেশন ত্রুটি।", fields }, { status: 422 });
  }

  const data = parsed.data;
  try {
    const updated = await db.projectUpdate.update({
      where: { id: updateId },
      data: {
        title: data.title,
        description: data.description,
        body: data.body?.trim() || null,
        image: data.image?.trim() || null,
        collectedAmount: data.collectedAmount,
        neededAmount: data.neededAmount,
        published: data.published,
        date: data.date ? new Date(data.date) : existing.date,
      },
    });

    await revalidateHome();
    const slug = await getStorySlug(existing.projectId);
    if (slug) await revalidateStory(slug);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[updates] update error:", err);
    return NextResponse.json({ error: "আপডেট করা যায়নি।" }, { status: 500 });
  }
}

/** DELETE — delete a timeline entry. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { updateId } = await params;
  const existing = await db.projectUpdate.findUnique({ where: { id: updateId } });
  if (!existing) return NextResponse.json({ error: "আপডেট পাওয়া যায়নি।" }, { status: 404 });

  await db.projectUpdate.delete({ where: { id: updateId } });

  await revalidateHome();
  const slug = await getStorySlug(existing.projectId);
  if (slug) await revalidateStory(slug);

  return NextResponse.json({ success: true, id: updateId });
}
