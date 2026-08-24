import { ModuleForm } from "@/components/admin/module-form";

export default function NewModulePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">
          নতুন মডিউল তৈরি করুন
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          একটি নতুন দুনিয়াবি মডিউল যোগ করুন। সব ফিল্ড পূরণ করে সেভ করুন।
        </p>
      </div>
      <ModuleForm initial={null} />
    </div>
  );
}
