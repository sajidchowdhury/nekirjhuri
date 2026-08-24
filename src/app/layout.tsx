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
  title: "নেকির ঝুড়ি — দুনিয়ার উসিলায় আখিরাতের সফলতা",
  description:
    "এই ফার্মের মালিক আল্লাহ তায়ালা, আমরা শুধু প্রতিনিধি। মেধা ও সময়কে পুঁজি করে, দুনিয়াবি উসিলায় আখিরাত ইমপ্রুভ করার মিশন — উম্মাহর প্রয়োজন, চলমান গল্প ও স্থায়ী প্রজেক্ট।",
  keywords: [
    "নেকির ঝুড়ি",
    "ইসলামিক দান",
    "জাকাত",
    "সদকা",
    "মাদরাসা",
    "মক্তব",
    "উম্মাহ",
    "দানশীলতা",
  ],
  authors: [{ name: "নেকির ঝুড়ি" }],
  openGraph: {
    title: "নেকির ঝুড়ি",
    description: "দুনিয়ার উসিলায় আখিরাতের সফলতা",
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
