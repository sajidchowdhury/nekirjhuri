import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminStoriesPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={BookOpen}
        title="চলমান গল্প (ব্লগ)"
        phase="7"
        description="স্টোরি ও টাইমলাইন আপডেট তৈরি করা যাবে — rich text editor (MDX), image, published/draft status সহ। প্রতিটি স্টোরির নিজস্ব SEO পেজ থাকবে।"
      />
    </div>
  );
}
