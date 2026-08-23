"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side SessionProvider wrapper.
 * Required for components that use useSession() (like the topbar).
 * Placed in the admin layout between the auth check and the shell.
 */
export function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
