import { LayoutDashboard, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <EmptyState
        icon={LayoutDashboard}
        title="ড্যাশবোর্ড"
        phase="9"
        description="অ্যাডমিন ড্যাশবোর্ডে মোট সংগৃহীত অর্থ, সক্রিয় প্রয়োজন, চলমান প্রজেক্ট ও সাম্প্রতিক ডোনেশনের পরিসংখ্যান দেখা যাবে। এটি Phase 9-এ তৈরি হবে।"
      />
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-gold" />
        <span>Phase 0 সম্পন্ন — পরবর্তী: Phase 1 (অথেনটিকেশন ও লগইন)</span>
      </div>
    </div>
  );
}
