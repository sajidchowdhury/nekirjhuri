/**
 * নেকির ঝুড়ি — Seed production data from Excel spreadsheet
 *
 * Inserts real production data into the database:
 *   - 9 UmmahNeeds (উম্মাহর প্রয়োজন)
 *   - 12 Projects / Developing Stories (চলমান গল্প)
 *   - 7 FixedProjects (স্থায়ী প্রজেক্ট)
 *
 * Replaces the old dummy seed data with real content.
 *
 * Usage:
 *   bun run seed:production
 *
 * Safe to run multiple times — checks for existing slug before inserting.
 */
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding production data from spreadsheet...");

  // ---------- UmmahNeeds (9 items) ----------
  const needs = [
    {
      title: "ইফতার প্যাকেজ",
      slug: "iftar-package",
      summary: "রমজানে দরিদ্র রোজাদারদের ইফতার-সেহরির প্যাকেজ",
      description: "রমজান মাসে হতদরিদ্র ব্যক্তি, অসচ্ছল পরিবার, মসজিদ ও মাদরাসার রোজাদারদের মাঝে ইফতার ও সেহরির প্রয়োজনীয় খাদ্যসামগ্রী বিতরণ। রমজানের বরকত ও মানবিকতার বার্তা সমাজের সব স্তরে পৌঁছে দেওয়াই মূল উদ্দেশ্য।",
      category: "family",
      targetAmount: 1500,
      urgency: "high",
      beneficiary: "১ জন ব্যক্তির ১ মাস: ১,৫০০ টাকা / ১০ দিন: ৫০০ টাকা",
      status: "active",
    },
    {
      title: "ইছার ঈদ বাজার",
      slug: "eid-bazar",
      summary: "ঈদের দিন দরিদ্র পরিবারের জন্য খাদ্য বাজার",
      description: "ঈদের আনন্দ সবার জন্য নিশ্চিত করতে দেশের বিভিন্ন অঞ্চলের অভাবগ্রস্ত পরিবারের হাতে প্রয়োজনীয় খাদ্যসামগ্রী সমৃদ্ধ ঈদ বাজার তুলে দেওয়া হয়।",
      category: "family",
      targetAmount: 500,
      urgency: "normal",
      beneficiary: "৫০০ টাকা / পরিবার",
      status: "active",
    },
    {
      title: "কোরবানির গোশত বিতরণ",
      slug: "qurbani-meat-distribution",
      summary: "কোরবানির গোশত দরিদ্রদের মাঝে বিতরণ",
      description: "ঈদুল আজহায় দরিদ্র, এতিম, বিধবা, প্রতিবন্ধী ও অসহায় মানুষের মাঝে কোরবানির গোশত পৌঁছে দিয়ে আনন্দের অংশীদার করা।",
      category: "family",
      targetAmount: 0,
      urgency: "normal",
      beneficiary: "আলোচনা সাপেক্ষে",
      status: "active",
    },
    {
      title: "শীতবস্ত্র বিতরণ কর্মসূচি",
      slug: "winter-clothes-distribution",
      summary: "শীতার্ত মানুষের জন্য কম্বল-চাদর",
      description: "তীব্র শীতে প্রত্যন্ত অঞ্চলের শীতার্ত মানুষের হাতে কম্বল, চাদর ও প্রয়োজনীয় শীতবস্ত্র পৌঁছে দেওয়া।",
      category: "family",
      targetAmount: 500,
      urgency: "high",
      beneficiary: "৫০০ টাকা / জন (টার্গেট ২০০ জন)",
      status: "active",
    },
    {
      title: "দুর্যোগকালীন মানবিক সহায়তা",
      slug: "disaster-relief",
      summary: "দুর্যোগকালীন ত্রাণ ও জরুরি সহায়তা",
      description: "প্রাকৃতিক দুর্যোগ, বন্যা, ঘূর্ণিঝড় বা যেকোনো সংকটময় পরিস্থিতিতে ক্ষতিগ্রস্ত মানুষের পাশে দাঁড়িয়ে ত্রাণ ও জরুরি সহায়তা প্রদান।",
      category: "emergency",
      targetAmount: 0,
      urgency: "critical",
      beneficiary: "আলোচনা সাপেক্ষে",
      status: "active",
    },
    {
      title: "নেকির ঝুড়ি",
      slug: "nekir-jhuri-need",
      summary: "নিয়মিত খাদ্য সহায়তা",
      description: "অসহায়, দরিদ্র ও উপার্জনে অক্ষম পরিবারগুলোর কাছে নিয়মিত প্রয়োজনীয় খাদ্যসামগ্রী বিতরণ।",
      category: "family",
      targetAmount: 0,
      urgency: "high",
      beneficiary: "আলোচনা সাপেক্ষে",
      status: "active",
    },
    {
      title: "ফান্ড ফর ফিলিস্তিন",
      slug: "fund-for-palestine",
      summary: "ফিলিস্তিন সহায়তা তহবিল",
      description: "ফিলিস্তিনের নির্যাতিত নারী-শিশু ও সাধারণ জনগণের জন্য সংগৃহীত অর্থ নির্ভরযোগ্য মাধ্যমে পৌঁছে দেওয়া।",
      category: "emergency",
      targetAmount: 0,
      urgency: "critical",
      beneficiary: "আলোচনা সাপেক্ষে",
      status: "active",
    },
    {
      title: "চিকিৎসা সহায়তা",
      slug: "medical-aid",
      summary: "দরিদ্র রোগীদের চিকিৎসা সহায়তা",
      description: "অর্থের অভাবে চিকিৎসা না পাওয়া অসহায় রোগীদের চিকিৎসা ব্যয়ে সহযোগিতা।",
      category: "medical",
      targetAmount: 0,
      urgency: "high",
      beneficiary: "আলোচনা সাপেক্ষে",
      status: "active",
    },
    {
      title: "রক্তদান কর্মসূচি",
      slug: "blood-donation",
      summary: "স্বেচ্ছাসেবী রক্তদান নেটওয়ার্ক",
      description: "স্বেচ্ছাসেবী রক্তদাতাদের নেটওয়ার্ক গড়ে তোলা, রক্তের গ্রুপ নির্ণয় ও জরুরি মুহূর্তে রক্ত সরবরাহ।",
      category: "medical",
      targetAmount: 0,
      urgency: "normal",
      beneficiary: "আলোচনা সাপেক্ষে",
      status: "active",
    },
  ];

  let needsCount = 0;
  for (const n of needs) {
    const existing = await db.ummahNeed.findUnique({ where: { slug: n.slug } });
    if (!existing) {
      await db.ummahNeed.create({ data: n });
      needsCount++;
    }
  }
  console.log(`  ✓ UmmahNeeds: ${needsCount} new inserted (${needs.length} total in spreadsheet)`);

  // ---------- Projects / Developing Stories (12 items) ----------
  const stories = [
    { name: "বাইজুল ছদা জামে মসজিদ নির্মাণ", slug: "baijul-sada-jame-masjid", description: "ইছারের অর্থায়নে নির্মাণাধীন দৃষ্টিনন্দন মসজিদ। মসজিদ নির্মাণ ও উন্নয়ন ইছারের অন্যতম গুরুত্বপূর্ণ খেদমত।", location: "গ্রাম: টেটুড়ি, থানা: ডুমুরিয়া, জেলা: খুলনা", tags: "মসজিদ নির্মাণ", targetAmount: 0 },
    { name: "মারকাজুল ছদা মাদ্রাসা পরিচালনা", slug: "markazul-sada-madrasa", description: "কুরআন তিলাওয়াত ও হিফজ, সহীহ আকীদা, নৈতিকতা ও জীবনঘনিষ্ঠ ইসলামী জ্ঞান শিক্ষার মাধ্যমে চরিত্রবান প্রজন্ম গঠন।", location: "গ্রাম: টেটুড়ি, থানা: ডুমুরিয়া, জেলা: খুলনা", tags: "মাদ্রাসা পরিচালনা", targetAmount: 0 },
    { name: "ইছার পাঠশালা", slug: "ichar-pathshala", description: "শিক্ষাবঞ্চিত শিশুদের মাঝে প্রাথমিক শিক্ষার আলো পৌঁছে দেওয়া। বর্তমানে মালিবাগ শাখায় প্রায় ৪০ জন শিশুকে শিক্ষা দেওয়া হচ্ছে।", location: "মালিবাগ, ঢাকা", tags: "শিক্ষা", targetAmount: 0 },
    { name: "ইছার মক্তব", slug: "ichar-maktab", description: "রংপুর জেলার বীরগঞ্জ থানা ও আশেপাশের এলাকায় ৮টি মক্তবের মাধ্যমে শিশু-কিশোরদের মৌলিক দ্বীনি শিক্ষা ও নৈতিক মূল্যবোধ গড়ে তোলা।", location: "রংপুর, বীরগঞ্জ", tags: "দ্বীনি শিক্ষা", targetAmount: 0 },
    { name: "পুকুর খনন ও আয়বর্ধন প্রকল্প", slug: "pond-excavation-income", description: "দ্বীনি প্রতিষ্ঠানকে আর্থিকভাবে স্বনির্ভর করতে উপযুক্ত স্থানে পুকুর খনন ও মাছ চাষের ব্যবস্থা।", location: "বিভিন্ন দ্বীনি প্রতিষ্ঠান", tags: "আয়বর্ধন", targetAmount: 0 },
    { name: "মেহনত বান্দরবান", slug: "mehnot-bandarban", description: "দুর্গম পাহাড়ি অঞ্চলে প্রাথমিক শিক্ষা (ইছার একাডেমি), বিশুদ্ধ পানি, প্রাথমিক চিকিৎসা, মসজিদ সংস্কার, নওমুসলিম পুনর্বাসন, দাঈ সহায়তা, স্বনির্ভরকরণ (কৃষি বীজ, গরু-ছাগল, সেলাই মেশিন, ভ্যান), শিশুদের খেলাধুলা ও শিক্ষা সামগ্রী বিতরণ।", location: "বান্দরবান (ঠাকুরবিবি সেন্টার, লামা)", tags: "পাহাড়ি উন্নয়ন", targetAmount: 0 },
    { name: "কেনিয়ায় ইছার কার্যক্রম", slug: "kenya-ichar", description: "কেনিয়ায় মসজিদ নির্মাণ ও সংস্কার, মাদ্রাসা উন্নয়ন এবং দরিদ্র ছাত্রদের মাঝে খাদ্য বিতরণ।", location: "কেনিয়া", tags: "আন্তর্জাতিক", targetAmount: 0 },
    { name: "তাদাব্বুরে কোরআন কর্মসূচি", slug: "tadabbure-quran", description: "অর্থ ও ব্যাখ্যাসহ কোরআনের শিক্ষা পাঠচক্র, আলোচনা সভা ও শিক্ষামূলক কার্যক্রমের মাধ্যমে ছড়িয়ে দেওয়া।", location: "দেশব্যাপী", tags: "দাওয়াহ", targetAmount: 0 },
    { name: "সুন্নত সচেতনতা ও প্রশিক্ষণ", slug: "sunnah-awareness-training", description: "মৃত মুসলমানের গোসল, কাফন, জানাজা ও দাফন সুন্নাহ অনুযায়ী সম্পন্ন করার জন্য মুয়াজ্জিন, খাদেম ও সংশ্লিষ্টদের বাস্তব প্রশিক্ষণ।", location: "দেশব্যাপী", tags: "প্রশিক্ষণ", targetAmount: 0 },
    { name: "নওমুসলিম সহায়তা কর্মসূচি", slug: "new-muslim-support", description: "নওমুসলিমদের আইনি সহায়তা, আর্থিক সহযোগিতা, মানসিক সাপোর্ট, বাসস্থান ও কর্মসংস্থানের ব্যবস্থা।", location: "দেশব্যাপী", tags: "নওমুসলিম", targetAmount: 0 },
    { name: "ক্বার্জে হাসানা", slug: "qarde-hasana", description: "দরিদ্র ও ক্ষুদ্র উদ্যোক্তাদের বিনা সুদে ঋণ দিয়ে ছোট ব্যবসা শুরু করার সুযোগ তৈরি।", location: "দেশব্যাপী", tags: "স্বনির্ভরতা", targetAmount: 0 },
    { name: "সাদাকায় জারিয়া প্রকল্প", slug: "sadaqah-jariyah", description: "শিক্ষা কার্যক্রম, দ্বীনি প্রতিষ্ঠান, দানমূলক অবকাঠামো ও তাফসীরে কুরআন বিতরণের মাধ্যমে স্থায়ী সওয়াবের ব্যবস্থা।", location: "দেশব্যাপী", tags: "সাদাকায়ে জারিয়া", targetAmount: 0 },
  ];

  let storiesCount = 0;
  for (const s of stories) {
    const existing = await db.project.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      await db.project.create({
        data: {
          ...s,
          status: "ongoing",
          published: true,
          featured: false,
        },
      });
      storiesCount++;
    }
  }
  console.log(`  ✓ Projects: ${storiesCount} new inserted (${stories.length} total in spreadsheet)`);

  // ---------- FixedProjects (7 items) ----------
  const fixedProjects = [
    { name: "গ্রন্থাগার ব্যবস্থাপনা", slug: "library-management", type: "mosque", description: "মসজিদভিত্তিক গ্রন্থাগার পরিচালনা ও সহযোগিতা; পাঠকদের জন্য উপকারী ইসলামী বইয়ের ব্যবস্থা করে নিয়মিত অধ্যয়ন ও গবেষণার পরিবেশ তৈরি।", monthlyCost: 0 },
    { name: "ইছার পাঠশালা (প্রতিষ্ঠিত শাখা)", slug: "ichar-pathshala-established", type: "moktob", description: "মালিবাগ শাখায় চলমান প্রাথমিক শিক্ষা কার্যক্রমের রক্ষণাবেক্ষণ ও সম্প্রসারণ।", monthlyCost: 0 },
    { name: "ইছার মক্তব (৮টি)", slug: "ichar-maktab-established", type: "moktob", description: "রংপুর-বীরগঞ্জ এলাকার ৮টি মক্তবের নিয়মিত পরিচালনা ও রক্ষণাবেক্ষণ।", monthlyCost: 0 },
    { name: "মারকাজুল ছদা মাদ্রাসা (প্রতিষ্ঠিত)", slug: "markazul-sada-established", type: "madrasha", description: "খুলনার টেটুড়িতে চলমান মাদ্রাসার অবকাঠামো ও শিক্ষা কার্যক্রম রক্ষণাবেক্ষণ।", monthlyCost: 0 },
    { name: "বৃক্ষরোপণ কর্মসূচি (প্রতিষ্ঠিত গাছ)", slug: "tree-plantation-maintenance", type: "mosque", description: "মসজিদ, মাদ্রাসা ও সামাজিক প্রতিষ্ঠানে রোপণকৃত ফলজ গাছের পরিচর্যা।", monthlyCost: 0 },
    { name: "পুকুর খনন প্রকল্প (প্রতিষ্ঠিত)", slug: "pond-projects-maintenance", type: "mosque", description: "ইতোমধ্যে খননকৃত পুকুর ও মাছ চাষ প্রকল্পের রক্ষণাবেক্ষণ।", monthlyCost: 0 },
    { name: "ঠাকুরবিবি সেন্টার (লামা)", slug: "thakurbibi-center", type: "mosque", description: "বান্দরবানের লামা উপজেলায় স্থাপিত কেন্দ্রের থাকা-খাওয়া, টয়লেট ও কার্যক্রম সমন্বয় সুবিধার রক্ষণাবেক্ষণ।", monthlyCost: 0 },
  ];

  let fixedCount = 0;
  for (const f of fixedProjects) {
    const existing = await db.fixedProject.findUnique({ where: { slug: f.slug } });
    if (!existing) {
      await db.fixedProject.create({
        data: {
          ...f,
          beneficiaries: 0,
          isActive: true,
        },
      });
      fixedCount++;
    }
  }
  console.log(`  ✓ FixedProjects: ${fixedCount} new inserted (${fixedProjects.length} total in spreadsheet)`);

  console.log("✅ Production data seed complete!");
  console.log(`   Total: ${needsCount + storiesCount + fixedCount} new records inserted`);
}

main()
  .catch((e) => {
    console.error("✗ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
