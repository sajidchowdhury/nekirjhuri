import Link from "next/link";
import {
  HeartHandshake,
  MessageCircle,
  Phone,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrCreateSettings } from "@/lib/settings";

export async function DonateCta() {
  const settings = await getOrCreateSettings();

  // Build contact actions from settings (only if available)
  const hasPhone = !!settings.phone;
  const hasWhatsapp = !!settings.whatsapp;

  // Normalize WhatsApp: if it's just a number, convert to wa.me link
  const whatsappUrl = settings.whatsapp
    ? settings.whatsapp.startsWith("http")
      ? settings.whatsapp
      : `https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`
    : null;

  return (
    <section className="relative py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-deep via-emerald to-emerald-deep text-primary-foreground p-8 sm:p-12 lg:p-16 emerald-glow">
          {/* pattern overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 25%, white 1.2px, transparent 1.2px), radial-gradient(circle at 85% 70%, white 1.2px, transparent 1.2px), radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px)",
              backgroundSize: "38px 38px, 44px 44px, 22px 22px",
            }}
          />
          {/* gold ring */}
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-gold/30"
          />
          <div
            aria-hidden
            className="absolute -right-8 top-8 h-32 w-32 rounded-full border border-gold/20"
          />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-ar text-gold-soft text-xl mb-3">
                وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ
              </p>
              <h2 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight">
                আপনার নেকির ঝুড়িতে{" "}
                <span className="text-gradient-gold">অবদান রাখুন</span>
              </h2>
              <p className="mt-4 text-cream/80 leading-relaxed max-w-xl">
                আপনি যা দান করবেন তা আপনার নিজের আখিরাতের পাথেয়। উম্মাহর একজন
                ভাই-বোনের প্রয়োজন পূরণে আজই এগিয়ে আসুন — ছোট হলেও, নিয়তের
                ইস্তিকলাসই মূল।
              </p>

              {/* Contact strip (only if settings have phone or whatsapp) */}
              {(hasPhone || whatsappUrl) && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {hasPhone && (
                    <a
                      href={`tel:${settings.phone!.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-full bg-cream/10 border border-cream/20 px-4 py-2 text-sm text-cream hover:bg-cream/20 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-gold" />
                      {settings.phone}
                    </a>
                  )}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-cream/10 border border-cream/20 px-4 py-2 text-sm text-cream hover:bg-cream/20 transition-colors"
                    >
                      <MessageSquareText className="h-4 w-4 text-gold" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Button
                asChild
                size="lg"
                className="bg-gold hover:bg-gold-deep text-emerald-deep font-700 rounded-full px-7 h-13 py-3.5 gold-glow"
              >
                <Link href="#needs">
                  <HeartHandshake className="h-5 w-5 mr-2" />
                  এখনই অবদান রাখুন
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream rounded-full px-7 h-13 py-3.5 bg-transparent"
              >
                <Link href="#story">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  গল্প দেখুন
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
