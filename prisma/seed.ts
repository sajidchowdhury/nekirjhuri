import { db } from "../src/lib/db";

/**
 * Seed script for নেকির ঝুড়ি — content based on the new mission narrative
 * (Rizqun & MadrashaOS as the two solution modules).
 *
 * Re-runnable: wipes UmmahNeed, Project, ProjectUpdate, FixedProject,
 * RevenueModule, SiteSettings at the start.
 */
async function main() {
  console.log("🌱 Seeding নেকির ঝুড়ি database (new content)...");

  // ---------- Clean content tables ----------
  await db.projectUpdate.deleteMany();
  await db.project.deleteMany();
  await db.ummahNeed.deleteMany();
  await db.fixedProject.deleteMany();
  await db.revenueModule.deleteMany();
  await db.siteSettings.deleteMany();
  console.log("  ✓ Cleaned content tables");

  // ---------- SiteSettings (contact info) ----------
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      phone: "01712-345678",
      email: "salam@nekirjhuri.com",
      address: "বাংলাদেশ",
      facebook: "https://facebook.com/nekirjhuri",
      whatsapp: "8801712345678",
    },
  });
  console.log("  ✓ SiteSettings created");

  // ---------- Revenue Modules: Rizqun & MadrashaOS ----------
  const modules = [
    {
      name: "রিজকুন (Rizqun)",
      slug: "rizqun",
      description:
        "আপনার দৈনন্দিন জীবনের নিরাপত্তা ও আরামের নিশ্চয়তা। শুধু একটি ডেলিভারি সার্ভিস নয়, এটি আপনার পরিবারের আমানতদার।",
      howItWorks:
        "## আমরা যা করি\nগ্রোসারি, মেডিসিন, সিসিটিভি ক্যামেরা, ইলেকট্রিক ও হোম সার্ভিস, এমনকি জরুরি প্রয়োজনে এম্বুলেন্স ও ব্লাড সাপোর্ট।\n\n## কীভাবে কাজ করে\nআপনি ঘরে বসে আমাদের হোয়াটসঅ্যাপে নক করুন বা ওয়েবসাইটে অর্ডার করুন। বাজারের ঠিক দামে আপনার দরকারি পণ্য নিরাপদে পৌঁছে যাবে আপনার হাতে।\n\n## নেকির ম্যাজিক\nআপনি রিজকুন থেকে যা কিনবেন, তার একটি নির্দিষ্ট পারসেন্টেজ সরাসরি নেকির ঝুড়ি ফানেলে চলে যাবে। অর্থাৎ, আপনার দৈনন্দিন কেনাকাটার সাথে সাথে আখিরাতের ঝুড়িও ভরে উঠছে সওয়াবে।",
      icon: "shopping",
      featuredImage: "/images/hero.png",
      socialLinks: JSON.stringify([
        { type: "whatsapp", url: "https://wa.me/8801712345678" },
        { type: "facebook", url: "https://facebook.com/rizqun.shop" },
        { type: "website", url: "https://nekirjhuri.com" },
      ]),
      funnelPercent: 30,
      order: 1,
      status: "active",
      isActive: true,
    },
    {
      name: "MadrashaOS",
      slug: "madrashaos",
      description:
        "ইলমের প্রতিষ্ঠানের ডিজিটাল খেদমত। এটি শুধু একটি সফটওয়্যার নয়; এটি আপনার প্রতিষ্ঠানকে নেকির ঝুড়ির বড় মিশনের সাথে যুক্ত করার একটি উসিলা।",
      howItWorks:
        "## আমরা যা করি\nমাদরাসার ছাত্রদের তথ্য, ফি কালেকশন, হিসাব-নিকাশ এবং অন্যান্য প্রশাসনিক কাজ সহজ করতে 'ইলম কেয়ার' সফটওয়্যার ও আধুনিক ওয়েবসাইট তৈরি করে দেওয়া হয়।\n\n## কীভাবে কাজ করে\nআমরা কোনো ইনস্টলেশন ফি ছাড়াই মাত্র ৩০০ টাকা মাসিক সাবস্ক্রিপশনে এই আধুনিক সিস্টেমটি দিচ্ছি। কারণ আমাদের উদ্দেশ্য মুনাফা নয়, খেদমত।\n\n## নেকির ম্যাজিক\nMadrashaOS-এর মাধ্যমে শুধু একটি প্রতিষ্ঠান ডিজিটাল হবে না, বরং সেই মাদরাসার ওস্তাদ ও তালেবে ইলমরা নেকির ঝুড়ির মূল কনসেপ্টের সাথে যুক্ত হবেন। এখান থেকেই শুরু হবে একটি পরিবার থেকে একটি সমাজের আত্মিক বিপ্লব।",
      icon: "book",
      featuredImage: "/images/madrasa.png",
      socialLinks: JSON.stringify([
        { type: "facebook", url: "https://facebook.com/madrashaos" },
        { type: "youtube", url: "https://youtube.com/@nekirjhuri" },
        { type: "website", url: "https://nekirjhuri.com" },
      ]),
      funnelPercent: 25,
      order: 2,
      status: "active",
      isActive: true,
    },
  ];
  for (const m of modules) {
    await db.revenueModule.create({ data: m });
  }
  console.log(`  ✓ ${modules.length} RevenueModules created (Rizqun, MadrashaOS)`);

  // ---------- Ummah Needs (where the funnel's output goes) ----------
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

  // ---------- Projects (Developing Story — the mission journey) ----------
  const project1 = await db.project.create({
    data: {
      name: "নেকির ঝুড়ি মিশন — Rizqun ও MadrashaOS",
      slug: "nekir-jhuri-mission",
      description:
        "দুনিয়ার Needs-কে আখিরাতের পুঁজিতে রূপান্তরের মিশন। মডিউলের মাধ্যমে দুনিয়া ও আখিরাতের সেতু বাঁধার যাত্রা।",
      location: "বাংলাদেশ",
      status: "ongoing",
      targetAmount: 500000,
      raisedAmount: 185000,
      featuredImage: "/images/hero.png",
      tags: "মিশন,রিজকুন,MadrashaOS",
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
        title: "কনসেপ্টের জন্ম — ফানেল",
        description:
          "একটি সত্য থেকে শুরু—একদিন দুনিয়া ছাড়তে হবে, সাথে যাবে শুধু আমল। নেকির ঝুড়ি এমন একটি ফানেল, যার এক প্রান্ত দুনিয়ার আসবাব, অন্য প্রান্ত আখিরাত।",
        body: "## কনসেপ্টের জন্ম\n\nএকটি সত্য থেকে শুরু—একদিন দুনিয়া ছাড়তে হবে। কবরের অন্ধকারে সাথে যাবে শুধু আমাদের আমল।\n\nনেকির ঝুড়ি এমন একটি **ফানেল**, যার একপ্রান্ত যুক্ত দুনিয়ার দৈনন্দিন আসবাবের সাথে, আর অন্য প্রান্ত চলে গেছে কবরের অন্ধকার টানেল পেরিয়ে আখিরাতে।",
        image: "/images/pattern.png",
        collectedAmount: 45000,
        neededAmount: 500000,
        published: true,
      },
      {
        projectId: project1.id,
        date: new Date("2024-11-20"),
        title: "রিজকুন — পরিবারের বিশ্বস্ত সঙ্গী চালু",
        description:
          "গ্রোসারি, মেডিসিন, সিসিটিভি, ইলেকট্রিক ও এম্বুলেন্স সাপোর্ট নিয়ে রিজকুন যাত্রা শুরু করেছে। প্রতিটি কেনাকাটা থেকে একটি অংশ ফানেলে যাচ্ছে।",
        body: "## রিজকুন চালু 🛒\n\nরিজকুন—আপনার পরিবারের বিশ্বস্ত সঙ্গী—যাত্রা শুরু করেছে।\n\n- গ্রোসারি, মেডিসিন, সিসিটিভি\n- ইলেকট্রিক ও হোম সার্ভিস\n- জরুরি এম্বুলেন্স ও ব্লাড সাপোর্ট\n\n**নেকির ম্যাজিক:** প্রতিটি কেনাকাটা থেকে ৩০% ফানেলে যাচ্ছে।",
        image: "/images/students.png",
        collectedAmount: 120000,
        neededAmount: 380000,
        published: true,
      },
      {
        projectId: project1.id,
        date: new Date("2025-01-10"),
        title: "MadrashaOS — প্রথম মাদরাসা ডিজিটাল হলো",
        description:
          "ইলম কেয়ার সফটওয়্যার ও ওয়েবসাইট দিয়ে প্রথম মাদরাসা ডিজিটাল হয়েছে। কোনো ইনস্টলেশন ফি ছাড়াই মাত্র ৩০০ টাকা মাসিকে। ওস্তাদ ও তালেবে ইলমরা এখন মিশনের সাথে যুক্ত।",
        body: "## প্রথম মাদরাসা ডিজিটাল 🕌\n\nMadrashaOS-এর মাধ্যমে প্রথম মাদরাসা ডিজিটাল হলো।\n\n- 'ইলম কেয়ার' সফটওয়্যার ও ওয়েবসাইট\n- কোনো ইনস্টলেশন ফি নেই\n- মাত্র ৩০০ টাকা মাসিক\n\n**নেকির ম্যাজিক:** ওস্তাদ ও তালেবে ইলমরা এখন মূল কনসেপ্টের সাথে যুক্ত। এখান থেকেই শুরু একটি পরিবার থেকে সমাজের আত্মিক বিপ্লব।",
        image: "/images/madrasa.png",
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
        "খুলনার উপকূলীয় অঞ্চলে লবণাক্ত পানির সমস্যা সমাধানে একটি গভীর নলকূপ স্থাপন। ফানেলের অর্থে প্রায় ৩০০ পরিবার সুপেয় পানি পাবে।",
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
        title: "খনন কাজ শুরু — মিষ্টি পানি পাওয়া গেছে",
        description:
          "১৮০ ফুট গভীরে মিষ্টি পানির স্তর পাওয়া গেছে! পাম্প ও পাইপ স্থাপনের কাজ চলছে। ফানেলের অর্থে ৯৬,০০০ টাকা সংগৃহীত।",
        body: "## মিষ্টি পানি পাওয়া গেছে! 💧\n\n১৮০ ফুট গভীরে মিষ্টি পানির স্তর পাওয়া গেছে!\n\n- পাম্প ও পাইপ স্থাপনের কাজ চলছে\n- **সংগৃহীত:** ৯৬,০০০ টাকা\n- **প্রয়োজন:** আর মাত্র ২৪,০০০ টাকা\n\nআলহামদুলিল্লাহ, শেষ ধাপে পৌঁছে গেছি।",
        image: "/images/madrasa.png",
        collectedAmount: 96000,
        neededAmount: 24000,
        published: true,
      },
    ],
  });
  console.log("  ✓ 2 Projects with updates created");

  // ---------- Fixed Projects (institutions on MadrashaOS) ----------
  const fixedProjects = [
    {
      name: "দারুল উলূম মাদরাসা",
      slug: "darul-uloom-madrasha",
      type: "madrasha",
      description:
        "MadrashaOS-এ যুক্ত প্রথম প্রতিষ্ঠান। ১২ বছর ধরে চলমান এই মাদরাসায় ১৫০ জন ছাত্র বিনা খরচে পড়াশোনা করে। এখন ইলম কেয়ার সফটওয়্যারে পরিচালিত।",
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
        "MadrashaOS-এ যুক্ত একটি গ্রামীণ মক্তব। ৬০ জন শিশুকে বিনা খরচে কুরআন ও প্রাথমিক দ্বীনি শিক্ষা দেওয়া হয়। ডিজিটাল ফি কালেকশন চালু।",
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
        "নেকির ঝুড়ির সাপোর্টে পরিচালিত এতিমখানা। ৩৫ জন এতিম ও সুবিধাবঞ্চিত শিশুর আশ্রয়, খাবার, পোশাক ও দ্বীনি শিক্ষার ব্যবস্থা।",
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

  console.log("✅ Seeding complete! (Rizqun & MadrashaOS content)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
