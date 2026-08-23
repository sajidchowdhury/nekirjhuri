# নেকির ঝুড়ি — Work Log

---
Task ID: 1
Agent: Z.ai Code (main)
Task: Build a modern, Islamic, clean, responsive website for the "নেকির ঝুড়ি" (Basket of Good Deeds) concept — a faith-driven farm whose owner is Allah and whose representatives run revenue modules that feed a "good-deeds funnel" flowing from dunya to akhirah. Site must present the concept, post Ummah needs (madrasa/student/medical etc.), show developing project stories with timelines, and list fixed running projects (madrasa/maktab). User mentioned Laravel+MySQL, but environment is Next.js 16 + Prisma (SQLite, MySQL-portable); built with the available stack.

Work Log:
- Read existing scaffold (Next.js 16, shadcn/ui, Prisma, dev server already running on :3000).
- Defined Prisma schema: UmmahNeed, Project + ProjectUpdate, FixedProject, RevenueModule. Ran `bun run db:push`.
- Generated 5 AI images (hero, madrasa, students, well, pattern) via z-ai image CLI (1344x768 / 1024x1024). Rephrased prompts to avoid content-filter triggers; corrected size to multiple-of-32.
- Wrote seed data (prisma/seed.ts): 6 UmmahNeeds, 2 Projects with 2-3 timeline updates each, 3 FixedProjects, 4 RevenueModules. Seeded successfully.
- Built 4 API routes (force-dynamic, Prisma-backed): /api/needs, /api/projects, /api/fixed-projects, /api/modules — all return 200.
- Installed Bengali + Arabic fonts via next/font: Hind Siliguri (body), Anek Bangla (display), Amiri (Arabic).
- Designed Islamic theme in globals.css: emerald/gold/cream palette (oklch), geometric pattern utilities (islamic-pattern, star-field), arch shapes, gold dividers, glass cards, text-gradient, custom scrollbar, animations (float-slow, rise, pulse-gold, shimmer).
- Built 11 section components: SiteHeader (sticky, mobile sheet), Hero, Concept (funnel diagram), SuccessVision (5 goal cards + dua band), Policy (3-step flow + dunya/akhirat), UmmahNeeds (client, API fetch, category filter, progress bars), DevelopingStory (client, project switcher + vertical timeline), FixedProjects (client, institution cards), ModulesFunnel (client, module cards + emerald basket panel), DonateCta, SiteFooter (sticky via mt-auto).
- Composed single-page app at src/app/page.tsx (only user-visible route). Sticky footer via min-h-screen flex flex-col + mt-auto.

Stage Summary:
- Initial Agent Browser verification caught a critical z-index bug: hero/modules background divs used `-z-10` which, with no stacking context on the page wrapper, pushed the background image + emerald gradient BEHIND the cream page background → hero appeared flat cream. Diagnosed via `agent-browser eval` (img loaded, but overlay computed transparent; root cause = negative z-index behind page bg).
- Fixed by switching background containers to `z-0` and adding `relative z-10` to content wrappers in Hero and ModulesFunnel.
- Post-fix VLM verification confirms: hero now shows photographic architecture image behind emerald overlay with cream/gold text; modules section shows Islamic geometric pattern; all data-driven sections (needs, story, fixed projects, modules) render real DB data with images, progress bars, timelines.
- Verified interactivity: category filter reduces 6 need cards → 2 (madrasa) correctly; mobile hamburger menu opens with nav links; responsive at 390px (no overflow); sticky footer present.
- Final `bun run lint` clean. All API endpoints return 200. No runtime/console errors.

Artifacts:
- prisma/schema.prisma, prisma/seed.ts
- src/app/api/{needs,projects,fixed-projects,modules}/route.ts
- src/app/page.tsx, src/app/layout.tsx, src/app/globals.css
- src/lib/types.ts (shared types + BDT/percent helpers + labels)
- src/components/sections/{site-header,hero,concept,success-vision,policy,ummah-needs,developing-story,fixed-projects,modules-funnel,donate-cta,site-footer,section-heading}.tsx
- public/images/{hero,madrasa,students,well,pattern}.png
