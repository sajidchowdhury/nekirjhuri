import { Users } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={Users}
        title="ইউজার ম্যানেজমেন্ট"
        phase="10"
        description="অ্যাডমিন ইউজার তৈরি, রোল পরিবর্তন (super_admin / editor) ও নিষ্ক্রিয় করা যাবে এখান থেকে। শুধু super_admin এই পেজ দেখতে পাবেন।"
      />
    </div>
  );
}
