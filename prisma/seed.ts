import { db } from "../src/lib/db";

/**
 * Seed script for নেকির ঝুড়ি content tables.
 *
 * Re-runnable: wipes UmmahNeed, Project, ProjectUpdate, FixedProject,
 * RevenueModule at the start (AdminUser is preserved — managed by seed-admin.ts).
 * Populates all Phase 0.3 fields (slugs, howItWorks, socialLinks, bKashNumber,
 * tags, body, gallery, etc.) so later phases have realistic data.
 */
async function main() {
  console.log("🌱 Seeding নেকির ঝুড়ি database...");

  // ---------- Clean content tables (preserve AdminUser) ----------
  await db.projectUpdate.deleteMany();
  await db.project.deleteMany();
  await db.ummahNeed.deleteMany();
  await db.fixedProject.deleteMany();
  await db.revenueModule.deleteMany();
  console.log("  ✓ Cleaned content tables");

  // ---------- Ummah Needs (with slug, bKash, donorCount) ----------
  const needs = [
    {
      title: "মাদরাসা ছাদ মেরামতের তহবিল",
      slug: "madrasa-roof-repair",
      summary: "ঝড়ে ক্ষতিগ্রস্ত ছাদ মেরামতে জরুরি অর্থ প্রয়োজন।",
      description:
        "সিলেটের একটি গ্রামীণ মাদরাসার টিনের ছাদ সাম্প্রতিক ঝড়ে ব্যাপকভাবে ক্ষতিগ্রস্ত হয়েছে। বর্ষায় বৃষ্টির পানি ঢুকে শিক্ষার্থীরা ক্লাস করতে পারছে না। ছাদ মেরামত ও নতুন টিন বসাতে অর্থ প্রয়োজন।",
      category: "madrasa",
      location: "সিলেট, বাংলাদেশ",
      targetAmount: 100000,
      raisedAmount: 38000,
      image: "/images/madrasa.png",
      urgency: "critical",
      beneficiary: "৮০ জন ছাত্র",
      status: "active",
      bKashNumber: "01712-345678",
      bKashType: "merchant",
      donorCount: 14,
    },
    {
      title: "এক তালেবে ইলমের পড়াশোনার খরচ",
      slug: "talibe-ilm-study-fund",
      summary: "একজন গরিব ছাত্রের দ্বীনি শিক্ষার বছরের খরচ।",
      description:
        "একজন মেধাবী তালেবে ইলম, যার পরিবার তার পড়াশোনার খরচ বহন করতে অক্ষম। তার এক বছরের বোর্ডিং, বই ও ভরণপোষণের জন্য সাহায্য দরকার। আপনার একটি ছোট অবদান তাকে একজন আলেম হওয়ার পথে এগিয়ে দিতে পারে।",
      category: "student",
      location: "চট্টগ্রাম, বাংলাদেশ",
      targetAmount: 24000,
      raisedAmount: 19500,
      image: "/images/students.png",
      urgency: "high",
      beneficiary: "১ জন ছাত্র",
      status: "active",
      bKashNumber: "01823-456789",
      bKashType: "personal",
      donorCount: 9,
    },
    {
      title: "গরিব পরিবারের চিকিৎসা সহায়তা",
      slug: "medical-aid-family",
      summary: "একজন রোগীর জরুরি অপারেশনের অর্থ সংগ্রহ।",
      description:
        "এক গরিব পরিবারের মা-এর জরুরি অস্ত্রোপচার প্রয়োজন। চিকিৎসকরা বলেছেন দেরি হলে পরিস্থিতি আরও খারাপ হবে। আপনার সাহায্য একটি জীবন বাঁচাতে পারে।",
      category: "medical",
      location: "ঢাকা, বাংলাদেশ",
      targetAmount: 60000,
      raisedAmount: 21000,
      image: "/images/well.png",
      urgency: "critical",
      beneficiary: "১টি পরিবার",
      status: "active",
      bKashNumber: "01934-567890",
      bKashType: "personal",
      donorCount: 7,
    },
    {
      title: "এতিম ছাত্রদের শীতবস্ত্র বিতরণ",
      slug: "orphan-winter-clothes",
      summary: "শীত আসছে — এতিম ছেলেমেয়েদের কম্বল ও গরম পোশাক।",
      description:
        "রাজশাহীর একটি এতিমখানার ৪৫ জন শিশুর জন্য শীতের কম্বল ও গরম পোশাক সংগ্রহ করা হচ্ছে। গত বছর কয়েকজন অসুস্থ হয়ে পড়েছিল। এবার আগেভাগে প্রস্তুতি নিতে চাই।",
      category: "family",
      location: "রাজশাহী, বাংলাদেশ",
      targetAmount: 35000,
      raisedAmount: 12000,
      image: "/images/students.png",
      urgency: "high",
      beneficiary: "৪৫ জন এতিম শিশু",
      status: "active",
      bKashNumber: "01712-345678",
      bKashType: "merchant",
      donorCount: 5,
    },
    {
      title: "নতুন মক্তব নির্মাণ তহবিল",
      slug: "new-moktob-construction",
      summary: "একটি গ্রামে বিনা খরচে কুরআন শেখার মক্তব স্থাপন।",
      description:
        "ময়মনসিংহের একটি প্রত্যন্ত গ্রামে কোনো মক্তব নেই। শিশুরা বিনা খরচে কুরআন শিখতে পারে এমন একটি ছোট মক্তব নির্মাণের উদ্যোগ নেওয়া হয়েছে। জমি ইতিমধ্যে দান করা হয়েছে, এখন নির্মাণ তহবিল দরকার।",
      category: "madrasa",
      location: "ময়মনসিংহ, বাংলাদেশ",
      targetAmount: 150000,
      raisedAmount: 52000,
      image: "/images/madrasa.png",
      urgency: "normal",
      beneficiary: "৫০+ শিশু",
      status: "active",
      bKashNumber: "01623-456789",
      bKashType: "personal",
      donorCount: 11,
    },
    {
      title: "বন্যায় ক্ষতিগ্রস্তদের খাদ্য সহায়তা",
      slug: "flood-relief-food",
      summary: "বন্যায় ঘরবাড়ি হারানো পরিবারের জরুরি খাদ্য।",
      description:
        "কুড়িগ্রামের চরাঞ্চলে বন্যায় শতাধিক পরিবার ঘরবাড়ি হারিয়েছে। তাদের জরুরি খাদ্য, পানীয় ও বাঁচার উপকরণ পৌঁছে দিতে তহবিল সংগ্রহ করা হচ্ছে।",
      category: "emergency",
      location: "কুড়িগ্রাম, বাংলাদেশ",
      targetAmount: 80000,
      raisedAmount: 64500,
      image: "/images/well.png",
      urgency: "critical",
      beneficiary: "১২০টি পরিবার",
      status: "active",
      bKashNumber: "01712-345678",
      bKashType: "merchant",
      donorCount: 23,
    },
  ];

  for (const n of needs) {
    await db.ummahNeed.create({ data: n });
  }
  console.log(`  ✓ ${needs.length} UmmahNeeds created`);

  // ---------- Projects (Developing Story) with tags, published, featured ----------
  const project1 = await db.project.create({
    data: {
      name: "নুরানি মাদরাসা নির্মাণ প্রকল্প",
      slug: "nurani-madrasha-build",
      description:
        "কুমিল্লার একটি গ্রামে একটি পূর্ণাঙ্গ নুরানি মাদরাসা ভবন নির্মাণের প্রকল্প। বর্তমানে ভাড়া বাসায় পরিচালিত হচ্ছে, নিজস্ব ভবন হলে আরও শিক্ষার্থী ভর্তি করা সম্ভব হবে।",
      location: "কুমিল্লা, বাংলাদেশ",
      status: "ongoing",
      targetAmount: 500000,
      raisedAmount: 185000,
      featuredImage: "/images/madrasa.png",
      tags: "মাদরাসা,নির্মাণ,কুমিল্লা",
      published: true,
      featured: true,
      startDate: new Date("2024-09-01"),
    },
  });

  await db.projectUpdate.createMany({
    data: [
      {
        projectId: project1.id,
        date: new Date("2024-09-15"),
        title: "স্থান পরিদর্শন ও জমি নির্বাচন",
        description:
          "দলটি কুমিল্লার গ্রামটি পরিদর্শন করেছে। স্থানীয় এক দাতা ৩ শতাংশ জমি দান করেছেন। ভূমি রেকর্ড যাচাই শেষ। প্রাথমিক নকশা তৈরি হয়েছে।",
        body: "## পরিদর্শন রিপোর্ট\n\n১৫ সেপ্টেম্বর আমাদের দল কুমিল্লার গ্রামটি পরিদর্শন করে। স্থানীয় এক দাতা **৩ শতাংশ জমি** দান করেছেন।\n\n### যা সম্পন্ন হয়েছে\n- ভূমি রেকর্ড যাচাই\n- প্রাথমিক নকশা প্রস্তুত\n- স্থানীয় পরিষদের অনুমোদন\n\nআল্লাহর রহমতে কাজ শুরু হতে যাচ্ছে।",
        image: "/images/madrasa.png",
        collectedAmount: 45000,
        neededAmount: 500000,
        published: true,
      },
      {
        projectId: project1.id,
        date: new Date("2024-11-20"),
        title: "ভিত্তি স্থাপন সম্পন্ন",
        description:
          "আপনাদের দোয়া ও অবদানে ভবনের ভিত্তি সম্পন্ন হয়েছে। ইট, বালু ও সিমেন্ট কেনা হয়েছে। পিলার বাঁধাই এর কাজ চলছে।",
        body: "## ভিত্তি সম্পন্ন 🤲\n\nআপনাদের দোয়া ও অবদানে ভবনের ভিত্তি সম্পন্ন হয়েছে।\n\n- ইট, বালু ও সিমেন্ট কেনা হয়েছে\n- পিলার বাঁধাইয়ের কাজ চলছে\n\nপরবর্তী ধাপ: দেয়াল নির্মাণ।",
        image: "/images/students.png",
        collectedAmount: 120000,
        neededAmount: 380000,
        published: true,
      },
      {
        projectId: project1.id,
        date: new Date("2025-01-10"),
        title: "নতুন বছরে দেয়াল নির্মাণ শুরু",
        description:
          "প্রথম তলার দেয়াল নির্মাণ শুরু হয়েছে। এখন পর্যন্ত ১,৮৫,০০০ টাকা সংগৃহীত। ছাদ ঢালাইয়ের জন্য আরও তহবিল প্রয়োজন।",
        body: "## দেয়াল নির্মাণ শুরু\n\nনতুন বছরে প্রথম তলার দেয়াল নির্মাণ শুরু হয়েছে।\n\n**সংগৃহীত:** ১,৮৫,০০০ টাকা\n**প্রয়োজন:** আরও ৩,১৫,০০০ টাকা (ছাদ ঢালাইয়ের জন্য)\n\nদোয়া করুন।",
        image: "/images/well.png",
        collectedAmount: 185000,
        neededAmount: 315000,
        published: true,
      },
    ],
  });

  const project2 = await db.project.create({
    data: {
      name: "পানীয় পানির কুয়া খনন প্রকল্প",
      slug: "water-well-project",
      description:
        "খুলনার উপকূলীয় অঞ্চলে লবণাক্ত পানির সমস্যা সমাধানে একটি গভীর নলকূপ স্থাপন। প্রায় ৩০০ পরিবার সুপেয় পানি পাবে।",
      location: "খুলনা, বাংলাদেশ",
      status: "ongoing",
      targetAmount: 120000,
      raisedAmount: 96000,
      featuredImage: "/images/well.png",
      tags: "পানি,কুয়া,খুলনা",
      published: true,
      featured: false,
      startDate: new Date("2024-12-01"),
    },
  });

  await db.projectUpdate.createMany({
    data: [
      {
        projectId: project2.id,
        date: new Date("2024-12-05"),
        title: "প্রয়োজনীয়তা যাচাই ও স্থান নির্বাচন",
        description:
          "উপকূলীয় গ্রামটি পরিদর্শন করে দেখা গেছে লবণাক্ত পানির কারণে স্থানীয়রা ভুগছে। একটি উচ্চভূমি নলকূপের জন্য নির্বাচন করা হয়েছে।",
        body: "## স্থান নির্বাচন\n\nউপকূলীয় গ্রামটি পরিদর্শন করে দেখা গেছে লবণাক্ত পানির কারণে স্থানীয়রা ভুগছে।\n\nএকটি উচ্চভূমি নলকূপের জন্য নির্বাচন করা হয়েছে।",
        image: "/images/well.png",
        collectedAmount: 30000,
        neededAmount: 120000,
        published: true,
      },
      {
        projectId: project2.id,
        date: new Date("2025-01-18"),
        title: "খনন কাজ শুরু — পানি পাওয়া গেছে",
        description:
          "১৮০ ফুট গভীরে মিষ্টি পানির স্তর পাওয়া গেছে! পাম্প ও পাইপ স্থাপনের কাজ চলছে। ৯৬,০০০ টাকা সংগৃহীত, শেষ ধাপের জন্য আর সামান্য প্রয়োজন।",
        body: "## মিষ্টি পানি পাওয়া গেছে! 💧\n\n১৮০ ফুট গভীরে মিষ্টি পানির স্তর পাওয়া গেছে!\n\n- পাম্প ও পাইপ স্থাপনের কাজ চলছে\n- **সংগৃহীত:** ৯৬,০০০ টাকা\n- **প্রয়োজন:** আর মাত্র ২৪,০০০ টাকা\n\nআলহামদুলিল্লাহ, শেষ ধাপে পৌঁছে গেছি।",
        image: "/images/madrasa.png",
        collectedAmount: 96000,
        neededAmount: 24000,
        published: true,
      },
    ],
  });
  console.log("  ✓ 2 Projects with updates created");

  // ---------- Fixed Projects (with slug + gallery) ----------
  const fixedProjects = [
    {
      name: "দারুল উলূম মাদরাসা",
      slug: "darul-uloom-madrasha",
      type: "madrasha",
      description:
        "১২ বছর ধরে চলমান একটি দ্বীনি মাদরাসা, যেখানে ১৫০ জন ছাত্র বিনা খরচে পড়াশোনা করে। মাসিক ভাড়া, খাবার ও শিক্ষক বেতন নিয়মিত ব্যয়।",
      location: "সিলেট, বাংলাদেশ",
      beneficiaries: 150,
      monthlyCost: 85000,
      establishedAt: "২০১৩",
      image: "/images/madrasa.png",
      gallery: JSON.stringify([
        "/images/madrasa.png",
        "/images/students.png",
      ]),
      isActive: true,
    },
    {
      name: "বায়তুল মুকাররম মক্তব",
      slug: "baitul-mukarrum-moktob",
      type: "moktob",
      description:
        "গ্রামীণ ৬০ জন শিশুকে বিনা খরচে কুরআন ও প্রাথমিক দ্বীনি শিক্ষা দেওয়া হয়। একজন মুআল্লিমা ও একজন হাফিজ নিয়মিত পড়ান।",
      location: "ময়মনসিংহ, বাংলাদেশ",
      beneficiaries: 60,
      monthlyCost: 22000,
      establishedAt: "২০১৮",
      image: "/images/students.png",
      gallery: JSON.stringify(["/images/students.png"]),
      isActive: true,
    },
    {
      name: "এতিম সদন — আশ্রয় ও শিক্ষা",
      slug: "orphanage-education",
      type: "orphanage",
      description:
        "৩৫ জন এতিম ও সুবিধাবঞ্চিত শিশুর আশ্রয়, খাবার, পোশাক ও শিক্ষার ব্যবস্থা। তাদের দুনিয়াবি ও দ্বীনি শিক্ষা একসাথে দেওয়া হয়।",
      location: "রাজশাহী, বাংলাদেশ",
      beneficiaries: 35,
      monthlyCost: 60000,
      establishedAt: "২০১৬",
      image: "/images/students.png",
      gallery: JSON.stringify([
        "/images/students.png",
        "/images/madrasa.png",
      ]),
      isActive: true,
    },
  ];
  for (const f of fixedProjects) {
    await db.fixedProject.create({ data: f });
  }
  console.log(`  ✓ ${fixedProjects.length} FixedProjects created`);

  // ---------- Revenue Modules (with slug, howItWorks, socialLinks, featuredImage) ----------
  const modules = [
    {
      name: "ই-কমার্স ও দান-খাদা",
      slug: "ecommerce-daan",
      description: "হালাল পণ্য বিক্রি ও দানের মাধ্যমে রেভিনিউ জেনারেশন।",
      howItWorks:
        "## কিভাবে কাজ করে\n\n১. হালাল পণ্য সোর্স করা হয়\n২. অনলাইনে বিক্রি হয়\n৩. লাভের ৩০% নেকির ঝুড়ি ফানেলে যায়\n৪. বাকি ৭০% পরবর্তী স্টক ও পরিচালনায় খরচ",
      icon: "shopping",
      featuredImage: "/images/madrasa.png",
      socialLinks: JSON.stringify([
        { type: "facebook", url: "https://facebook.com/nekirjhuri.shop" },
        { type: "whatsapp", url: "https://wa.me/8801712345678" },
      ]),
      funnelPercent: 30,
      order: 1,
      status: "active",
      isActive: true,
    },
    {
      name: "কনসালটেন্সি ও সার্ভিস",
      slug: "consultancy-service",
      description: "মেধা ভিত্তিক সেবা — ডিজাইন, ডেভেলপমেন্ট, মার্কেটিং।",
      howItWorks:
        "## কিভাবে কাজ করে\n\n১. ক্লায়েন্টের প্রজেক্ট গ্রহণ\n২. দলের মেধা দিয়ে ডেলিভারি\n৩. লাভের ২৫% ফানেলে\n৪. বাকি ৭৫% দলের ভরণপোষণ ও টুলস",
      icon: "briefcase",
      featuredImage: "/images/students.png",
      socialLinks: JSON.stringify([
        { type: "linkedin", url: "https://linkedin.com/company/nekirjhuri" },
      ]),
      funnelPercent: 25,
      order: 2,
      status: "active",
      isActive: true,
    },
    {
      name: "এজুকেশন প্ল্যাটফর্ম",
      slug: "education-platform",
      description: "অনলাইন দ্বীনি ও দুনিয়াবি শিক্ষা সেবা।",
      howItWorks:
        "## কিভাবে কাজ করে\n\n১. কোর্স তৈরি ও প্রকাশ\n২. ছাত্র ভর্তি\n৩. টিউশন ফি থেকে ৩৫% ফানেলে\n৪. বাকি ৬৫% শিক্ষক ও প্ল্যাটফর্ম খরচ",
      icon: "book",
      featuredImage: "/images/students.png",
      socialLinks: JSON.stringify([
        { type: "youtube", url: "https://youtube.com/@nekirjhuri" },
        { type: "facebook", url: "https://facebook.com/nekirjhuri.edu" },
      ]),
      funnelPercent: 35,
      order: 3,
      status: "active",
      isActive: true,
    },
    {
      name: "কৃষি ও ফার্ম",
      slug: "agriculture-farm",
      description: "হালাল কৃষি উৎপাদন ও বিতরণ।",
      howItWorks:
        "## কিভাবে কাজ করে\n\n১. জমিতে হালাল ফসল চাষ\n২. উৎপাদিত পণ্য বাজারজাত\n৩. লাভের ২০% ফানেলে\n৪. বাকি ৮০% পরবর্তী চাষ ও শ্রমিক",
      icon: "leaf",
      featuredImage: "/images/well.png",
      socialLinks: JSON.stringify([
        { type: "facebook", url: "https://facebook.com/nekirjhuri.farm" },
      ]),
      funnelPercent: 20,
      order: 4,
      status: "active",
      isActive: true,
    },
  ];
  for (const m of modules) {
    await db.revenueModule.create({ data: m });
  }
  console.log(`  ✓ ${modules.length} RevenueModules created`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
