import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fixedProjectCreateSchema } from "@/lib/validations/fixed-project";
import { slugify, slugifyOrFallback, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome, revalidateProject } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/** POST — create a fixed project. */
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

  const parsed = fixedProjectCreateSchema.safeParse(body);
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
  const baseSlug = data.slug ? slugify(data.slug) : slugifyOrFallback(data.name);
  const uniqueSlug = await ensureUniqueSlug(baseSlug, async (s) => {
    const existing = await db.fixedProject.findUnique({ where: { slug: s } });
    return !!existing;
  });

  try {
    const project = await db.fixedProject.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        type: data.type,
        description: data.description,
        location: data.location?.trim() || null,
        beneficiaries: data.beneficiaries,
        monthlyCost: data.monthlyCost,
        establishedAt: data.establishedAt?.trim() || null,
        image: data.image?.trim() || null,
        gallery: data.gallery?.trim() || null,
        isActive: data.isActive,
      },
    });

    await revalidateHome();
    if (project.slug) await revalidateProject(project.slug);

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("[fixed-projects] create error:", err);
    return NextResponse.json(
      { error: "তৈরি করা যায়নি।" },
      { status: 500 }
    );
  }
}

/** GET — list ALL fixed projects (admin sees all incl inactive). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const projects = await db.fixedProject.findMany({
    orderBy: [{ isActive: "desc" }, { establishedAt: "asc" }],
  });

  return NextResponse.json({ projects });
}
