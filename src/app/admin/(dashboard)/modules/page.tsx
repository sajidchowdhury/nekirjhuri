import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminModulesPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={ShoppingBag}
        title="দুনিয়াবি মডিউল"
        phase="4"
        description="রেভিনিউ মডিউল তৈরি, সম্পাদনা, ক্রম পরিবর্তন ও নিষ্ক্রিয় করা যাবে এখান থেকে। প্রতিটি মডিউলের description, how-it-works, image ও social links থাকবে।"
      />
    </div>
  );
}
