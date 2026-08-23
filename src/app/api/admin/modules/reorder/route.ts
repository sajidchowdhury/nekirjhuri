import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { moduleReorderSchema } from "@/lib/validations/module";
import { revalidateHome } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/modules/reorder
 *
 * Auth-gated. Updates the `order` field of multiple modules at once.
 * Used by the drag-to-reorder UI on the modules list page.
 *
 * Body: { items: [{id, order}, ...] }
 * Response (200): { success: true }
 */
export async function PATCH(request: Request) {
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

  const parsed = moduleReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ভ্যালিডেশন ত্রুটি।" },
      { status: 422 }
    );
  }

  // Update each module's order in a transaction
  try {
    await db.$transaction(
      parsed.data.items.map((item) =>
        db.revenueModule.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    await revalidateHome();

    return NextResponse.json({ success: true, count: parsed.data.items.length });
  } catch (err) {
    console.error("[modules] reorder error:", err);
    return NextResponse.json(
      { error: "ক্রম পরিবর্তন করা যায়নি।" },
      { status: 500 }
    );
  }
}
