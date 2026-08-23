import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Facebook,
  Youtube,
  Instagram,
  Twitter,
  MessageCircle,
  Send,
} from "lucide-react";
import { getOrCreateSettings } from "@/lib/settings";

const LINKS = [
  { href: "#concept", label: "কনসেপ্ট" },
  { href: "#success", label: "সফলতার সংজ্ঞা" },
  { href: "#needs", label: "উম্মাহর প্রয়োজন" },
  { href: "#story", label: "চলমান গল্প" },
  { href: "#projects", label: "স্থায়ী প্রজেক্ট" },
  { href: "#how", label: "কিভাবে কাজ করে" },
];

/** Social link config: field name → icon component. */
const SOCIAL_LINKS = [
  { key: "facebook", icon: Facebook, label: "Facebook" },
  { key: "youtube", icon: Youtube, label: "YouTube" },
  { key: "instagram", icon: Instagram, label: "Instagram" },
  { key: "twitter", icon: Twitter, label: "Twitter" },
  { key: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { key: "telegram", icon: Send, label: "Telegram" },
] as const;

export async function SiteFooter() {
  const settings = await getOrCreateSettings();

  // Build the list of active social links from settings
  const activeSocials = SOCIAL_LINKS.filter(
    (s) => settings[s.key as keyof typeof settings] as string | null
  ).map((s) => ({
    ...s,
    url: settings[s.key as keyof typeof settings] as string,
  }));

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

            {/* Social links */}
            {activeSocials.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {activeSocials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cream/10 text-cream/80 hover:bg-gold hover:text-emerald-deep transition-colors"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
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
              {settings.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-gold transition-colors"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="hover:text-gold transition-colors"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
              {!settings.email && !settings.phone && !settings.address && (
                <li className="text-cream/40 italic text-xs">
                  যোগাযোগ তথ্য এখনো সেট করা হয়নি।
                </li>
              )}
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
