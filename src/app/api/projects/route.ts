import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/projects — public. Returns published stories with published updates. */
export async function GET() {
  try {
    const projects = await db.project.findMany({
      where: { published: true },
      include: {
        updates: {
          where: { published: true },
          orderBy: { date: "asc" },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to load stories" },
      { status: 500 }
    );
  }
}
