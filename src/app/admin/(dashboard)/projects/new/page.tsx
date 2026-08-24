import { FixedProjectForm } from "@/components/admin/fixed-project-form";

export default function NewProjectPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">নতুন প্রজেক্ট তৈরি করুন</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          মাদরাসা, মক্তব, এতিমখানা ইত্যাদি স্থায়ী প্রতিষ্ঠান।
        </p>
      </div>
      <FixedProjectForm initial={null} />
    </div>
  );
}
