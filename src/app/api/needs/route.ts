import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const needs = await db.ummahNeed.findMany({
      where: { status: "active" },
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ needs });
  } catch (error) {
    console.error("Failed to fetch needs:", error);
    return NextResponse.json(
      { error: "Failed to load needs" },
      { status: 500 }
    );
  }
}
