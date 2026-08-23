import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/modules
 *
 * PUBLIC. Returns all active revenue modules, ordered by `order`.
 * Returns the full field set so the public ModulesFunnel section can
 * show a "বিস্তারিত" link and the /modules/[slug] detail page can
 * render howItWorks + socialLinks + featuredImage.
 *
 * Response (200): { modules: [...] }
 */
export async function GET() {
  try {
    const modules = await db.revenueModule.findMany({
      where: {
        isActive: true,
        status: "active",
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        howItWorks: true,
        icon: true,
        featuredImage: true,
        socialLinks: true,
        funnelPercent: true,
        order: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return NextResponse.json(
      { error: "Failed to load modules" },
      { status: 500 }
    );
  }
}
