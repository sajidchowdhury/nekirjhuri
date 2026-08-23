import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminProjectsPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={Building2}
        title="স্থায়ী প্রজেক্ট"
        phase="8"
        description="মাদরাসা, মক্তব, এতিমখানা ইত্যাদি স্থায়ী প্রতিষ্ঠান তৈরি ও সম্পাদনা — image gallery, beneficiaries, monthly cost সহ।"
      />
    </div>
  );
}
