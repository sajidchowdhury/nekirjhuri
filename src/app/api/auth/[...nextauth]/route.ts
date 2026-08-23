import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic — auth routes must never be statically cached
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
