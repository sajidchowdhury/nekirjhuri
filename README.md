# নেকির ঝুড়ি 🌿

> এই ফার্মের মালিক আল্লাহ তায়ালা — আমরা শুধু প্রতিনিধি।
> মেধা ও সময়কে পুঁজি করে, দুনিয়াবি উসিলায় আখিরাত ইমপ্রুভ করার মিশন।

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

একটি আধুনিক, ইসলামিক, রেসপন্সিভ ওয়েবসাইট — একটি ঈমানদার মিশনের জন্য। এই প্ল্যাটফর্ম উম্মাহর জরুরি প্রয়োজন (মাদরাসা / ছাত্র / চিকিৎসা / পরিবার / ত্রাণ) প্রকাশ করে, চলমান প্রজেক্টের ধাপে ধাপে গল্প (টাইমলাইন সহ) দেখায়, এবং স্থায়ী প্রতিষ্ঠান (মাদরাসা / মক্তব / এতিমখানা) তালিকাভুক্ত করে।

---

## ✨ ফিচার

- **একক-পৃষ্ঠা সাইট** — Hero, কনসেপ্ট (ফানেল ডায়াগ্রাম), দোয়া, পলিসি, উম্মাহর প্রয়োজন, চলমান গল্প, স্থায়ী প্রজেক্ট, কিভাবে কাজ করে, Donate CTA, Footer
- **Islamic Aesthetic** — Emerald green + gold + cream palette, Bengali (Hind Siliguri, Anek Bangla) ও Arabic (Amiri) ফন্ট, জ্যামিতিক প্যাটার্ন, খিলান আকৃতি
- **ডেটা-চালিত সেকশন** — ৪টি API route (Prisma ORM দ্বারা)
- **রেসপন্সিভ** — মোবাইল থেকে ডেস্কটপ, hamburger menu সহ
- **AI-জেনারেটেড ইমেজ** — hero, মাদরাসা, ছাত্র, কুয়া, প্যাটার্ন

## 🛠️ প্রযুক্তি স্ট্যাক

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| UI | React 19 + shadcn/ui + Tailwind CSS 4 + Lucide |
| Fonts | next/font — Hind Siliguri, Anek Bangla, Amiri |
| Database | Prisma 6 → MySQL (prod) / SQLite (dev) |
| AI (optional) | z-ai-web-dev-sdk (server-side only) |

## 🚀 দ্রুত শুরু (লোকাল ডেভেলপমেন্ট)

```bash
# 1. Dependencies ইনস্টল
bun install            # or: npm install

# 2. Environment সেটআপ
cp .env.example .env   # তারপপ .env এডিট করুন

# 3. ডেটাবেস সেটআপ (SQLite — dev default)
bunx prisma generate
bunx prisma db push
bun run prisma/seed.ts   # seed ডেটা লোড করুন

# 4. Dev server চালু
bun run dev            # http://localhost:3000
```

## 📦 প্রোডাকশন ডিপ্লয়মেন্ট

সম্পূর্ণ ডিপ্লয়মেন্ট গাইড দেখুন:

👉 **[`upload/ChowdhuryBari_Deployment_Guide.md`](./upload/ChowdhuryBari_Deployment_Guide.md)**

এতে রয়েছে: fresh Ubuntu VPS-এ শুরু থেকে ডিপ্লয়, MySQL সেটআপ, SSL (Caddy/Nginx), PM2/systemd, Dockerfile, এবং smoke test প্রসিডিউর।

### প্রোডাকশনে MySQL-এ সুইচ

1. `prisma/schema.prisma`-এ `provider = "mysql"` করুন
2. `.env`-এ MySQL `DATABASE_URL` সেট করুন
3. `bunx prisma generate && bunx prisma db push && bun run prisma/seed.ts`
4. `bun run build` → `node .next/standalone/server.js`

## 📁 প্রজেক্ট স্ট্রাকচার

```
nekir-jhuri/
├── prisma/
│   ├── schema.prisma          # UmmahNeed, Project, ProjectUpdate, FixedProject, RevenueModule
│   └── seed.ts                # Seed ডেটা
├── src/
│   ├── app/
│   │   ├── page.tsx           # একমাত্র user-visible route
│   │   ├── layout.tsx         # Fonts + metadata
│   │   ├── globals.css        # Islamic theme
│   │   └── api/               # 4টি Route Handler
│   ├── components/sections/   # সব পেজ সেকশন
│   └── lib/                   # db client, types, helpers
├── public/images/             # AI-জেনারেটেড ইমেজ
├── upload/                    # ডিপ্লয়মেন্ট গাইড
└── next.config.ts             # output: "standalone"
```

## 🗃️ ডেটা মডেল

- **UmmahNeed** — উম্মাহর জরুরি প্রয়োজন (এককালীন)
- **Project** + **ProjectUpdate** — চলমান গল্প (টাইমলাইন সহ)
- **FixedProject** — স্থায়ী প্রতিষ্ঠান (মাদরাসা / মক্তব / এতিমখানা)
- **RevenueModule** — রেভিনিউ মডিউল ও ফানেল পারসেন্ট

## 📜 লাইসেন্স

এই প্রজেক্ট একটি দ্বীনি মিশনের অংশ — সর্বস্বত্ব আল্লাহর রহমতে।

---

اللهم تقبل

“হে আল্লাহ! আমাদের দোষগুলো লুকিয়ে দিন, আমাদের ভালোবাসার রাসুল ﷺ-এর সামনে আমাদের সাদিক বলে পরিচয় করিয়ে দিন।”
