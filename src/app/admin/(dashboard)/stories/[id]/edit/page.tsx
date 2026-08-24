import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StoryForm } from "@/components/admin/story-form";

export const dynamic = "force-dynamic";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await db.project.findUnique({ where: { id } });

  if (!story) notFound();

  const initial = {
    id: story.id,
    name: story.name,
    slug: story.slug,
    description: story.description,
    location: story.location,
    status: story.status,
    targetAmount: story.targetAmount,
    raisedAmount: story.raisedAmount,
    featuredImage: story.featuredImage,
    tags: story.tags,
    published: story.published,
    featured: story.featured,
    startDate: story.startDate.toISOString(),
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">গল্প সম্পাদনা</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          &quot;{story.name}&quot; — পরিবর্তন করে সেভ করুন।
        </p>
      </div>
      <StoryForm initial={initial} />
    </div>
  );
}
