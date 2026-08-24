import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateCreateSchema } from "@/lib/validations/story";
import { revalidateHome, revalidateStory } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/** POST — create a timeline update for a story. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const story = await db.project.findUnique({ where: { id } });
  if (!story) return NextResponse.json({ error: "গল্প পাওয়া যায়নি।" }, { status: 404 });

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
    const update = await db.projectUpdate.create({
      data: {
        projectId: id,
        title: data.title,
        description: data.description,
        body: data.body?.trim() || null,
        image: data.image?.trim() || null,
        collectedAmount: data.collectedAmount,
        neededAmount: data.neededAmount,
        published: data.published,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    await revalidateHome();
    await revalidateStory(story.slug);

    return NextResponse.json(update, { status: 201 });
  } catch (err) {
    console.error("[updates] create error:", err);
    return NextResponse.json({ error: "তৈরি করা যায়নি।" }, { status: 500 });
  }
}

/** GET — list all updates for a story. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const updates = await db.projectUpdate.findMany({
    where: { projectId: id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ updates });
}
