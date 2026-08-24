import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ModuleForm } from "@/components/admin/module-form";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const revModule = await db.revenueModule.findUnique({ where: { id } });

  if (!revModule) {
    notFound();
  }

  const initial = {
    id: revModule.id,
    name: revModule.name,
    slug: revModule.slug,
    description: revModule.description,
    howItWorks: revModule.howItWorks,
    icon: revModule.icon,
    featuredImage: revModule.featuredImage,
    socialLinks: revModule.socialLinks,
    funnelPercent: revModule.funnelPercent,
    status: revModule.status,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">
          মডিউল সম্পাদনা
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          "{revModule.name}" — পরিবর্তন করে সেভ করুন।
        </p>
      </div>
      <ModuleForm initial={initial} />
    </div>
  );
}
