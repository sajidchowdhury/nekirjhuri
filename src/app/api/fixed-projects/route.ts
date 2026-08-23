import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.fixedProject.findMany({
      where: { isActive: true },
      orderBy: [{ establishedAt: "asc" }],
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
