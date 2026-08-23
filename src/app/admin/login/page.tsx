import { LoginForm } from "@/components/admin/login-form";

/**
 * Admin login page.
 *
 * This page sits OUTSIDE the (dashboard) route group, so it does NOT
 * inherit the auth-guarded admin layout. It's public — anyone can view it.
 *
 * The actual form logic lives in the client component <LoginForm />
 * (uses next-auth signIn with redirect:false for inline error handling).
 */
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-deep via-emerald to-emerald-deep p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ornamental rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-gold/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full border border-gold/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/4 h-32 w-32 rounded-full border border-gold/10"
      />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-deep text-emerald-deep shadow-lg ring-2 ring-gold/30 mb-3">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 9h18l-1.6 9.2A2 2 0 0 1 17.4 20H6.6a2 2 0 0 1-2-1.8L3 9Z" />
              <path d="M8 9V6a4 4 0 0 1 8 0v3" />
              <path d="M3 9h18" />
              <path d="M9 13v3M15 13v3M12 13v3" />
            </svg>
          </span>
          <h1 className="font-display font-800 text-2xl text-cream">
            নেকির ঝুড়ি
          </h1>
          <p className="font-ar text-gold-soft text-base mt-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-cream/60 text-xs mt-2">
            অ্যাডমিন প্যানেলে প্রবেশ করুন
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-2xl shadow-xl border border-gold/20 p-6 sm:p-8">
          <LoginForm />
        </div>

        {/* Footer note */}
        <p className="text-center text-cream/50 text-xs mt-6 leading-relaxed">
          এই ফার্মের মালিক আল্লাহ তায়ালা — আমরা শুধু প্রতিনিধি।
          <br />
          অননুমোদিত প্রবেশ নিষিদ্ধ।
        </p>
      </div>
    </div>
  );
}
