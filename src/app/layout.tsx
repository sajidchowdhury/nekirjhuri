import type { Metadata } from "next";
import { Hind_Siliguri, Anek_Bangla, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bn",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const anekBangla = Anek_Bangla({
  variable: "--font-display",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-ar",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "নেকির ঝুড়ি — দুনিয়ার Needs, এবার আখিরাতের পুঁজি",
  description:
    "এই ফার্মের মালিক আল্লাহ তায়ালা — আমরা শুধু প্রতিনিধি। আমাদের মডিউলের মাধ্যমে আপনার দৈনন্দিন কেনাকাটা ও খেদমতকে পরিণত করুন আখিরাতের অবিরাম সওয়াবে।",
  keywords: [
    "নেকির ঝুড়ি",
    "রিজকুন",
    "MadrashaOS",
    "ইসলামিক মিশন",
    "আখিরাত",
    "সওয়াব",
    "মাদরাসা",
    "উম্মাহ",
    "হালাল সার্ভিস",
  ],
  authors: [{ name: "নেকির ঝুড়ি" }],
  openGraph: {
    title: "নেকির ঝুড়ি",
    description: "দুনিয়ার Needs, এবার হবে আখিরাতের পুঁজি।",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${hindSiliguri.variable} ${anekBangla.variable} ${amiri.variable} antialiased bg-background text-foreground font-bn`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
