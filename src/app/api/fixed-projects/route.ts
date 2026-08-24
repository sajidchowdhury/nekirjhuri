import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/fixed-projects — public. Returns active fixed projects with
 * slug + gallery for detail pages. */
export async function GET() {
  try {
    const projects = await db.fixedProject.findMany({
      where: { isActive: true },
      orderBy: [{ establishedAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        location: true,
        beneficiaries: true,
        monthlyCost: true,
        establishedAt: true,
        image: true,
        gallery: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch fixed projects:", error);
    return NextResponse.json(
      { error: "Failed to load fixed projects" },
      { status: 500 }
    );
  }
}
