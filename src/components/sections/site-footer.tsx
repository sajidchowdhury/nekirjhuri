import Link from "next/link";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

const LINKS = [
  { href: "#concept", label: "কনসেপ্ট" },
  { href: "#success", label: "সফলতার সংজ্ঞা" },
  { href: "#needs", label: "উম্মাহর প্রয়োজন" },
  { href: "#story", label: "চলমান গল্প" },
  { href: "#projects", label: "স্থায়ী প্রজেক্ট" },
  { href: "#how", label: "কিভাবে কাজ করে" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto bg-emerald-deep text-cream">
      {/* gold top border ornament */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-deep text-emerald-deep ring-1 ring-gold/40">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
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
                </svg>
              </span>
              <div>
                <p className="font-display font-700 text-xl text-cream">
                  নেকির ঝুড়ি
                </p>
                <p className="font-ar text-gold-soft text-sm">
                  بسم الله الرحمن الرحيم
                </p>
              </div>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed max-w-md">
              এই ফার্মের মালিক আল্লাহ তায়ালা — আমরা শুধু প্রতিনিধি। মেধা ও
              সময়কে পুঁজি করে, দুনিয়াবি উসিলায় আখিরাত ইমপ্রুভ করার মিশন।
            </p>
            <p className="mt-4 text-xs text-gold-soft/80 italic">
              “আখিরাতে প্রোপার ওয়েতে ইমপ্যাক্ট ফেলতে হলে আমাদের দুনিয়াবি আসবাব
              ব্যবহার করতে হবে।”
            </p>
          </div>

          {/* links */}
          <div>
            <p className="font-display font-700 text-cream mb-4">দ্রুত লিংক</p>
            <ul className="space-y-2.5">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-cream/70 hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <p className="font-display font-700 text-cream mb-4">যোগাযোগ</p>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span>info@nekirjhuri.org</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span>+৮৮০ ১XXX-XXXXXX</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span>বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 pt-6 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60">
          <p>© {new Date().getFullYear()} নেকির ঝুড়ি। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1.5">
            আল্লাহর রহমতে তৈরি
            <Heart className="h-3.5 w-3.5 text-gold fill-gold" />
          </p>
        </div>
      </div>
    </footer>
  );
}
