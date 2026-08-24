import { NeedForm } from "@/components/admin/need-form";

export default function NewNeedPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">
          নতুন প্রয়োজন তৈরি করুন
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          একটি নতুন উম্মাহর প্রয়োজন যোগ করুন। ছবি, বাজেট, bKash নম্বর সহ।
        </p>
      </div>
      <NeedForm initial={null} />
    </div>
  );
}
