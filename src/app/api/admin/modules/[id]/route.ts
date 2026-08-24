import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moduleCreateSchema } from "@/lib/validations/module";
import { slugify, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome, revalidateModule } from "@/lib/revalidate";
import { requireRole } from "@/lib/rbac";
import { checkCSRF } from "@/lib/csrf";
import { logAction, getClientIP } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * /api/admin/modules/[id]
 *
 * - GET: fetch a single module by id (editor+).
 * - PUT: update a module (super_admin, zod-validated).
 * - DELETE: delete a module (super_admin).
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("editor");
  if (error) return error;

  const { id } = await params;
  const revModule = await db.revenueModule.findUnique({ where: { id } });

  if (!revModule) {
    return NextResponse.json(
      { error: "মডিউল পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  return NextResponse.json(revModule);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  // CSRF check
  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  const { id } = await params;

  // Check existence
  const existing = await db.revenueModule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "মডিউল পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = moduleCreateSchema.safeParse(body);
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

  // If slug changed or was provided, ensure uniqueness (excluding self)
  let finalSlug = existing.slug;
  if (data.slug !== undefined && data.slug !== null && data.slug !== "") {
    const candidate = slugify(data.slug);
    if (candidate !== existing.slug) {
      finalSlug = await ensureUniqueSlug(candidate, async (s) => {
        const found = await db.revenueModule.findFirst({
          where: { slug: s, NOT: { id } },
        });
        return !!found;
      });
    } else {
      finalSlug = candidate;
    }
  }

  const cleaned = {
    name: data.name,
    slug: finalSlug,
    description: data.description,
    howItWorks: data.howItWorks?.trim() || null,
    icon: data.icon?.trim() || null,
    featuredImage: data.featuredImage?.trim() || null,
    socialLinks: data.socialLinks?.trim() || null,
    funnelPercent: data.funnelPercent,
    status: data.status,
    isActive: data.status === "active",
  };

  try {
    const updated = await db.revenueModule.update({
      where: { id },
      data: cleaned,
    });

    await revalidateHome();
    if (updated.slug) await revalidateModule(updated.slug);
    if (existing.slug && existing.slug !== updated.slug) {
      await revalidateModule(existing.slug);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[modules] update error:", err);
    return NextResponse.json(
      { error: "আপডেট করা যায়নি।" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  // CSRF check
  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  const { id } = await params;

  const existing = await db.revenueModule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "মডিউল পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  await db.revenueModule.delete({ where: { id } });

  await revalidateHome();
  if (existing.slug) await revalidateModule(existing.slug);

  return NextResponse.json({ success: true, id });
}
