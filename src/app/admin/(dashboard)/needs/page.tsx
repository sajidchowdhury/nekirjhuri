import { HeartHandshake } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminNeedsPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={HeartHandshake}
        title="উম্মাহর প্রয়োজন"
        phase="5"
        description="জরুরি প্রয়োজন তৈরি ও সম্পাদনা — image, target budget, bKash number, urgency, category সহ। প্রতিটি প্রয়োজনের জন্য আলাদা ডোনেশন ট্র্যাকিং থাকবে।"
      />
    </div>
  );
}
