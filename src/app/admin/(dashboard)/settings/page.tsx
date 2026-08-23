import { Settings } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={Settings}
        title="সাইট সেটিংস"
        phase="3"
        description="ফোন, ইমেইল, ঠিকানা ও সোশ্যাল মিডিয়া লিংক এখান থেকে সম্পাদনা করা যাবে। পরিবর্তনগুলো সাইটের footer ও donate section-এ লাইভ দেখা যাবে।"
      />
    </div>
  );
}
