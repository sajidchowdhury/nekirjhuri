"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Admin login form.
 *
 * Calls next-auth signIn('credentials', ...) with email + password.
 * - On success: redirects to callbackUrl (default /admin).
 * - On invalid creds: shows inline error (signIn returns {error}).
 * - On network/server error: shows generic error.
 *
 * The form is intentionally simple (no react-hook-form) — only 2 fields,
 * and the loading + error UX is clearer with direct useState.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError ? "লগইন সেশন শেষ হয়ে গেছে। আবার লগইন করুন।" : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // we handle redirect ourselves for better UX
      });

      if (!res || res.error) {
        // Credentials provider returns error="CredentialsSignin" on bad creds
        setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।");
        setLoading(false);
        return;
      }

      // Success — navigate to the callback URL
      router.push(callbackUrl);
      router.refresh(); // ensure server components re-read the new session
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-600 text-emerald-deep">
          ইমেইল
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@nekirjhuri.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="pl-9 h-11"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-sm font-600 text-emerald-deep"
        >
          পাসওয়ার্ড
        </Label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="pl-9 pr-10 h-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-deep transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full h-11 bg-emerald-deep hover:bg-emerald text-primary-foreground font-600 rounded-lg shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            লগইন হচ্ছে...
          </>
        ) : (
          <>
            লগইন করুন
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {/* Back to site */}
      <div className="text-center pt-1">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-emerald-deep transition-colors"
        >
          ← ওয়েবসাইটে ফিরে যান
        </Link>
      </div>
    </form>
  );
}
