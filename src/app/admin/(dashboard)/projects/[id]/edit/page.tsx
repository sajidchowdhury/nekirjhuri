import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FixedProjectForm } from "@/components/admin/fixed-project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await db.fixedProject.findUnique({ where: { id } });

  if (!project) notFound();

  const initial = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    type: project.type,
    description: project.description,
    location: project.location,
    beneficiaries: project.beneficiaries,
    monthlyCost: project.monthlyCost,
    establishedAt: project.establishedAt,
    image: project.image,
    gallery: project.gallery,
    isActive: project.isActive,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">প্রজেক্ট সম্পাদনা</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          &quot;{project.name}&quot; — পরিবর্তন করে সেভ করুন।
        </p>
      </div>
      <FixedProjectForm initial={initial} />
    </div>
  );
}
