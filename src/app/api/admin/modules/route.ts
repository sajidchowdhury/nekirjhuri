import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moduleCreateSchema } from "@/lib/validations/module";
import { slugify, slugifyOrFallback, ensureUniqueSlug } from "@/lib/validations/slug";
import { revalidateHome, revalidateModule } from "@/lib/revalidate";
import { requireRole } from "@/lib/rbac";
import { checkCSRF } from "@/lib/csrf";
import { logAction, getClientIP } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/modules
 *
 * Auth-gated. Creates a new revenue module. Validates with zod.
 * Auto-generates a slug from the name if not provided; ensures uniqueness.
 *
 * Response (201): the created module.
 * Errors: 401, 422 (validation), 409 (slug collision), 500.
 */
export async function POST(request: Request) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  // CSRF check
  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

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

  // Resolve slug: explicit → slugify(name) → fallback
  const baseSlug = data.slug
    ? slugify(data.slug)
    : slugifyOrFallback(data.name);

  // Ensure uniqueness (exclude nothing on create)
  const uniqueSlug = await ensureUniqueSlug(baseSlug, async (s) => {
    const existing = await db.revenueModule.findUnique({ where: { slug: s } });
    return !!existing;
  });

  // Coerce empty strings → null
  const cleaned = {
    ...data,
    slug: uniqueSlug,
    howItWorks: data.howItWorks?.trim() || null,
    icon: data.icon?.trim() || null,
    featuredImage: data.featuredImage?.trim() || null,
    socialLinks: data.socialLinks?.trim() || null,
  };

  // Set order to max+1 if not provided
  const maxOrder = await db.revenueModule.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  // isActive mirrors status for backward-compat with public API
  const isActive = cleaned.status === "active";

  try {
    const revModule = await db.revenueModule.create({
      data: {
        name: cleaned.name,
        slug: cleaned.slug,
        description: cleaned.description,
        howItWorks: cleaned.howItWorks,
        icon: cleaned.icon,
        featuredImage: cleaned.featuredImage,
        socialLinks: cleaned.socialLinks,
        funnelPercent: cleaned.funnelPercent,
        order,
        status: cleaned.status,
        isActive,
      },
    });

    await revalidateHome();
    if (revModule.slug) await revalidateModule(revModule.slug);

    return NextResponse.json(revModule, { status: 201 });
  } catch (err) {
    console.error("[modules] create error:", err);
    return NextResponse.json(
      { error: "তৈরি করা যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/modules
 *
 * Auth-gated. Returns ALL modules (including inactive/archived), ordered
 * by `order`. Used by the admin list page. (Public /api/modules only
 * returns active ones.)
 *
 * Response (200): { modules: [...] }
 */
export async function GET() {
  const { error } = await requireRole("editor");
  if (error) return error;

  const modules = await db.revenueModule.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ modules });
}
