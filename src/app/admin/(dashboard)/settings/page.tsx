import { SettingsForm } from "@/components/admin/settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">
          সাইট সেটিংস
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          ফোন, ইমেইল, ঠিকানা ও সোশ্যাল মিডিয়া লিংক সম্পাদনা করুন। সেভ করলে সাইটের
          footer ও donate section-এ সাথে সাথে দেখা যাবে।
        </p>
      </div>

      {/* Form */}
      <SettingsForm />
    </div>
  );
}
