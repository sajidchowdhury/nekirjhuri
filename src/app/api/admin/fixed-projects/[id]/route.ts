import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fixedProjectCreateSchema } from "@/lib/validations/fixed-project";
import { slugify, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome, revalidateProject } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

/** GET — single fixed project by id. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const project = await db.fixedProject.findUnique({ where: { id } });

  if (!project) {
    return NextResponse.json({ error: "প্রজেক্ট পাওয়া যায়নি।" }, { status: 404 });
  }
  return NextResponse.json(project);
}

/** PUT — update a fixed project. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const existing = await db.fixedProject.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "প্রজেক্ট পাওয়া যায়নি।" }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
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
  let finalSlug = existing.slug;
  if (data.slug) {
    const candidate = slugify(data.slug);
    if (candidate !== existing.slug) {
      finalSlug = await ensureUniqueSlug(candidate, async (s) => {
        const found = await db.fixedProject.findFirst({
          where: { slug: s, NOT: { id } },
        });
        return !!found;
      });
    } else {
      finalSlug = candidate;
    }
  }

  try {
    const updated = await db.fixedProject.update({
      where: { id },
      data: {
        name: data.name,
        slug: finalSlug,
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
    if (updated.slug) await revalidateProject(updated.slug);
    if (existing.slug && existing.slug !== updated.slug) {
      await revalidateProject(existing.slug);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[fixed-projects] update error:", err);
    return NextResponse.json({ error: "আপডেট করা যায়নি।" }, { status: 500 });
  }
}

/** DELETE — delete a fixed project. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });

  const { id } = await params;
  const existing = await db.fixedProject.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "প্রজেক্ট পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.fixedProject.delete({ where: { id } });

  await revalidateHome();
  if (existing.slug) await revalidateProject(existing.slug);

  return NextResponse.json({ success: true, id });
}
