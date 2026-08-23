import { Image as ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminUploadsPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={ImageIcon}
        title="মিডিয়া লাইব্রেরি"
        phase="2"
        description="আপলোড করা সব ছবি এখানে দেখা, সার্চ ও ডিলিট করা যাবে। ছবি অপটিমাইজ (sharp) করে webp ফরম্যাটে সেভ হবে।"
      />
    </div>
  );
}
