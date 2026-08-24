import { StoryForm } from "@/components/admin/story-form";

export default function NewStoryPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">নতুন গল্প তৈরি করুন</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          একটি নতুন চলমান গল্প — টাইমলাইন আপডেট সহ।
        </p>
      </div>
      <StoryForm initial={null} />
    </div>
  );
}
