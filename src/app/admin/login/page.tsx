import { LockKeyhole } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-deep via-emerald to-emerald-deep p-6">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-xl border border-gold/20 p-8">
          <EmptyState
            icon={LockKeyhole}
            title="অ্যাডমিন লগইন"
            phase="1"
            description="লগইন পেজ Phase 1, Session 1.1-এ তৈরি হবে — email ও password ফর্ম সহ। এখন পর্যন্ত লগইন করতে হলে API ব্যবহার করুন।"
          />
        </div>
        <p className="text-center text-cream/70 text-sm mt-4 font-ar">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>
    </div>
  );
}
