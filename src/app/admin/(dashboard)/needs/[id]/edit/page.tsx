import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { NeedForm } from "@/components/admin/need-form";

export const dynamic = "force-dynamic";

export default async function EditNeedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const need = await db.ummahNeed.findUnique({ where: { id } });

  if (!need) {
    notFound();
  }

  const initial = {
    id: need.id,
    title: need.title,
    slug: need.slug,
    summary: need.summary,
    description: need.description,
    category: need.category,
    location: need.location,
    targetAmount: need.targetAmount,
    image: need.image,
    urgency: need.urgency,
    beneficiary: need.beneficiary,
    status: need.status,
    bKashNumber: need.bKashNumber,
    bKashType: need.bKashType,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">
          প্রয়োজন সম্পাদনা
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          &quot;{need.title}&quot; — পরিবর্তন করে সেভ করুন।
        </p>
      </div>
      <NeedForm initial={initial} />
    </div>
  );
}
