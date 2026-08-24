import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminModulesPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function AdminModulesPage() {
  const session = await getServerSession(authOptions);

  // Role check: only super_admin can manage modules
  if (session?.user?.role !== "super_admin") {
    redirect("/admin");
  }

  return <AdminModulesPageClient />;
}
