import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminSessionProvider } from "@/components/admin/session-provider";

/**
 * Admin layout — server component.
 *
 * 1. Reads the session via getServerSession (defense in depth: the
 *    middleware already checked the JWT, but this also gets user info
 *    for the topbar and blocks rendering if the session is invalid).
 * 2. If no session → redirect to /admin/login.
 * 3. If session exists → render the admin shell (sidebar + topbar + content).
 *
 * The SessionProvider wrapper is needed because the topbar uses
 * useSession() (client-side hook) for the logout dropdown.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto custom-scroll">
            {children}
          </main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
