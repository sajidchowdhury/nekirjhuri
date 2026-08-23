import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminDonationsPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={Wallet}
        title="ডোনেশন ট্র্যাকিং"
        phase="6"
        description="প্রাপ্ত ডোনেশন রেকর্ড করা, কনফার্ম/রিজেক্ট করা ও ফিল্টার করা যাবে। কনফার্ম করলে সাইটের প্রোগ্রেস বার লাইভ আপডেট হবে।"
      />
    </div>
  );
}
