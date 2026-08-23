# নেকির ঝুড়ি — Admin Panel Implementation Plan

> **Purpose:** A phase-by-phase roadmap to build a complete admin panel that manages every part of the নেকির ঝুড়ি public website — revenue modules, Ummah needs + live donation tracking, developing-story blog, fixed projects, and site-wide contact/social settings.
>
> **How to use this document:** Work through phases **in order**. Each phase is split into **sessions** (focused 1–3 hour work blocks). Do not start the next phase until every session in the current phase passes its *Definition of Done*. At the end of every phase you will have a working, demoable slice of the admin panel.
>
> **Stack:** Next.js 16 (App Router) · Prisma · TypeScript · shadcn/ui · Tailwind · NextAuth.js v4 · @mdxeditor/editor · zod · TanStack Query. All already installed.

---

## 0. Goals & Scope

### What the admin panel must deliver

| # | Admin capability | Public-site impact |
|---|------------------|--------------------|
| 1 | Create / edit / reorder / deactivate **দুনিয়াবি মডিউল** (revenue modules), each with its own description, "how it works", image, social-media links, and funnel % | Modules Funnel section (`#how`) shows the live list + total funnel %; adding a module dynamically appears on the site |
| 2 | Create / edit **উম্মাহর প্রয়োজন** (Ummah needs) with image, target budget, bKash number, urgency, category | Ummah Needs section (`#needs`) shows the live list with progress bars |
| 3 | **Record received donations** against a need → auto-updates raised amount | Progress bars on the site update **live** (auto-refresh via TanStack Query/SWR) |
| 4 | Manage **চলমান গল্প** as a blog — project entries + timeline updates with rich text, images, published/draft status | Developing Story section (`#story`) shows published stories with timelines |
| 5 | Create / edit **স্থায়ী প্রজেক্ট** (fixed projects) — madrasa / maktab / orphanage etc., with image, beneficiaries, monthly cost | Fixed Projects section (`#projects`) shows the live list |
| 6 | Edit **site-wide settings** — phone, email, address, social-media links (Facebook, YouTube, Instagram, WhatsApp, etc.) | Footer + Donate CTA show live contact info |
| 7 | Each **দুনিয়াবি মডিউল** has its own page/card with description, "how it works", and social links | Optional: a module detail view on the public site |

### Non-goals (out of scope for this plan)

- Online payment gateway integration (bKash/Nagad/SSL Commerz auto-verification) — donations are **manually recorded** by an admin after receiving money. Auto-gateway is a future phase after this plan.
- Multi-tenant / multiple organizations — single tenant only.
- Public donor accounts / login — admin-only auth.
- Mobile apps.

---

## 1. Architecture & Tech Decisions

### 1.1 Admin route group

All admin UI lives under the App Router route group `/admin/*`:

```
src/app/admin/
├── layout.tsx              ← auth guard + admin shell (sidebar, header)
├── page.tsx                ← dashboard
├── login/page.tsx          ← public login page (unprotected)
├── settings/page.tsx       ← site contact/social
├── modules/
│   ├── page.tsx            ← list
│   ├── new/page.tsx        ← create
│   └── [id]/edit/page.tsx  ← edit
├── needs/…
├── donations/…             ← record + list donations
├── stories/…               ← blog (project + updates)
├── projects/…              ← fixed projects
└── uploads/…               ← media library (Phase 2)
```

> ⚠️ **Sandbox note:** The current dev sandbox only exposes `/` to the user. The admin routes will work on the **production server** where all routes are accessible. In this sandbox, admin routes still compile and run — they're just not linked from the public page. Build & test against `http://localhost:3000/admin` directly.

### 1.2 Authentication — NextAuth.js v4 (Credentials provider)

- Single `AdminUser` table (email + bcrypt password hash + role).
- NextAuth Credentials provider validates against the DB.
- Session strategy: **JWT** (stateless, works on standalone serverless-ish deploys).
- Middleware (`src/middleware.ts`) protects `/admin/*` (except `/admin/login`).
- Two roles: `super_admin` (everything) and `editor` (content only — no settings, no other admins). Phase 1 ships `super_admin` only; role granularity is a Phase 10 polish item.

### 1.3 Data fetching

- **Admin pages:** Server Components fetch directly via Prisma (fast, secure, no client fetch).
- **Admin forms (mutations):** Client Components call `fetch('/api/admin/...')` → Route Handler validates with zod → Prisma write → revalidate page.
- **Public site:** already uses `/api/*` + TanStack-style fetch. We'll add **SWR or TanStack Query** to the Ummah Needs section so progress bars auto-refresh every 15s when a donation is recorded.

### 1.4 Image uploads

- Phase 2 builds a **centralized upload service**: `POST /api/admin/upload` → saves to `public/uploads/<yyyy>/<mm>/<uuid>.<ext>` → returns the public path.
- DB table `UploadedImage` tracks every file (for a media library + orphan cleanup).
- Images optimized with `sharp` (already installed) — generate a web-optimized version + keep original.
- Future: swap storage backend to S3/Cloudinary by changing one service file.

### 1.5 Rich text (blog)

- `@mdxeditor/editor` (already installed) for the story update editor — Markdown-based, stores as a string in DB, renders with `react-markdown` on the public site (already installed).

### 1.6 Validation

- Every API mutation validates input with **zod** schemas (already installed). Schemas live in `src/lib/validations/`.

### 1.7 Revalidation

- After any admin mutation, call `revalidatePath('/')` (and relevant `#section` anchors) so the public site reflects changes immediately.
- For the live donation progress, the public Needs section polls its API (no full revalidation needed each time).

---

## 2. Database Schema Changes (summary)

Full field lists are in each phase. New/changed models at a glance:

| Model | Status | Purpose |
|-------|--------|---------|
| `AdminUser` | **NEW** | Admin login (email, passwordHash, role) |
| `SiteSettings` | **NEW** | Singleton — phone, email, address, social links |
| `UploadedImage` | **NEW** | Media library tracking |
| `RevenueModule` | **EXTEND** | + slug, howItWorks (rich), socialLinks (JSON), featuredImage, order, status |
| `UmmahNeed` | **EXTEND** | + bKashNumber, bKashType, donorCount, slug |
| `Donation` | **NEW** | Per-need received donations (amount, method, txnId, status, receivedAt) |
| `Project` | **EXTEND** | + slug, tags, published, authorId, featured |
| `ProjectUpdate` | **EXTEND** | + body (rich markdown), published |
| `FixedProject` | minor EXTEND | + slug, gallery (JSON of image paths) |
| `AuditLog` | **NEW** (Phase 10) | Who did what, when |

---

## 3. Phase Roadmap (dependency graph)

```
Phase 0 (Foundation) ──┐
                       ├─▶ Phase 1 (Auth & Shell) ──┐
                       │                            ├─▶ Phase 2 (Uploads) ──┐
                       │                            │                        │
                       │                            │   Phase 3 (Site Settings) ◀── depends on Shell only
                       │                            │                        │
                       │                            │   Phase 4 (Modules) ────── depends on Uploads
                       │                            │                        │
                       │                            │   Phase 5 (Needs) ──────── depends on Uploads
                       │                            │                        │
                       │                            │   Phase 6 (Donations) ──── depends on Needs
                       │                            │                        │
                       │                            │   Phase 7 (Blog/Stories) ── depends on Uploads
                       │                            │                        │
                       │                            │   Phase 8 (Fixed Projects) ── depends on Uploads
                       │                            │                        │
                       │                            │   Phase 9 (Dashboard) ────── depends on all content phases
                       │                            │                        │
                       │                            │   Phase 10 (Polish & Deploy) ── depends on everything
```

**Recommended order:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10.

Phases 3–8 are mostly independent once 2 is done; if you have multiple developers they can run in parallel after Phase 2.

---

## Phase 0 — Foundation & Schema Scaffolding

**Goal:** Set up the admin data layer, auth config skeleton, and shared utilities so every later phase has a consistent base. No UI yet.

### Session 0.1 — Admin user model + auth config skeleton
- **Tasks**
  - Add `AdminUser` model to `prisma/schema.prisma` (id, email @unique, name, passwordHash, role enum, timestamps).
  - Install `bcryptjs` (runtime) + `@types/bcryptjs` (dev).
  - Create `src/lib/auth.ts` — NextAuth config with Credentials provider (JWT session, compare bcrypt, return role in token).
  - Create `src/app/api/auth/[...nextauth]/route.ts` exporting the handler.
  - Create `.env` entries: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_BOOTSTRAP_EMAIL`.
- **Files**
  - `prisma/schema.prisma` (edit)
  - `src/lib/auth.ts` (new)
  - `src/app/api/auth/[...nextauth]/route.ts` (new)
- **Definition of Done**
  - `bunx prisma db push` runs clean.
  - A seed script `prisma/seed-admin.ts` creates one `super_admin` with a known password and prints a confirmation.

### Session 0.2 — Shared utilities (validation, revalidation, slug)
- **Tasks**
  - Create `src/lib/validations/` folder; add a shared `slug.ts` (slugify helper) and `pagination.ts`.
  - Create `src/lib/revalidate.ts` — wraps `revalidatePath` with logging.
  - Create `src/lib/upload-path.ts` — builds `public/uploads/yyyy/mm/<uuid>.<ext>` paths.
- **Definition of Done**
  - All helpers have TypeScript types and are importable from any server file.

### Session 0.3 — Extend existing models (non-breaking)
- **Tasks**
  - Extend `RevenueModule`: add `slug`, `howItWorks String?`, `socialLinks String?` (JSON string), `featuredImage String?`, `order Int @default(0)`, `status String @default("active")`.
  - Extend `UmmahNeed`: add `slug`, `bKashNumber String?`, `bKashType String @default("personal")`, `donorCount Int @default(0)`.
  - Extend `Project`: add `slug @unique`, `tags String?`, `published Boolean @default(false)`, `authorId String?`, `featured Boolean @default(false)`.
  - Extend `ProjectUpdate`: add `body String?` (markdown), `published Boolean @default(true)`.
  - Extend `FixedProject`: add `slug`, `gallery String?` (JSON of paths).
  - Run `bunx prisma db push` (accept data loss for additive cols — all nullable/defaulted).
  - Update `prisma/seed.ts` to populate the new fields for existing rows (slugs, social links sample, etc.).
- **Definition of Done**
  - Schema pushes without error; existing public site still renders identically with seeded data.

### Session 0.4 — Admin layout shell + middleware
- **Tasks**
  - Create `src/middleware.ts` protecting `/admin/*` (except `/admin/login`) — redirect to login if no session token.
  - Create `src/app/admin/layout.tsx` — server component that reads the session, renders the shell (sidebar + topbar) only for authenticated users; otherwise redirect.
  - Create `src/components/admin/sidebar.tsx` + `topbar.tsx` (shadcn Sidebar + Avatar + logout button).
  - Create `src/app/admin/page.tsx` placeholder ("Dashboard — coming in Phase 9").
- **Definition of Done**
  - Visiting `/admin` while logged out redirects to `/admin/login`.
  - After login (Phase 1), the shell renders with nav links to all sections (links can 404 until their phases land).

**Phase 0 exit criteria:** Schema extended, auth config compiles, middleware guards `/admin`, admin shell skeleton renders. Public site unchanged.

---

## Phase 1 — Authentication & Admin Shell

**Goal:** A working login flow + the admin shell with navigation. After this phase you can log in and see the (empty) admin.

### Session 1.1 — Login page + NextAuth wiring
- **Tasks**
  - Create `src/app/admin/login/page.tsx` — centered card with email + password (shadcn Form + Input + Button), calls `signIn('credentials', ...)`.
  - Wire `src/lib/auth.ts` to read `ADMIN_BOOTSTRAP_EMAIL`/password via `bcrypt.compare`.
  - Handle error states (invalid creds, too many attempts).
- **Definition of Done**
  - `/admin/login` shows the form; valid creds redirect to `/admin`; invalid shows an inline error.

### Session 1.2 — Logout + session display
- **Tasks**
  - Add a "Logout" button in `topbar.tsx` → `signOut({ redirect: '/admin/login' })`.
  - Show admin name + role badge in the topbar.
- **Definition of Done**
  - Logout returns to login page; protected pages are inaccessible until re-login.

### Session 1.3 — Admin navigation + empty states
- **Tasks**
  - Build sidebar nav: Dashboard, দুনিয়াবি মডিউল, উম্মাহর প্রয়োজন, Donations, চলমান গল্প, স্থায়ী প্রজেক্ট, Site Settings, Media Library.
  - Each link points to its future route; routes that don't exist yet show a friendly "Coming in Phase X" empty-state page component.
  - Add a reusable `EmptyState` component (`src/components/admin/empty-state.tsx`).
- **Definition of Done**
  - Clicking every sidebar item either shows its phase's UI or a "Coming soon" card — no raw 404.

**Phase 1 exit criteria:** Admin can log in, log out, navigate the shell. No content management yet — that starts in Phase 3.

---

## Phase 2 — Image Upload Infrastructure

**Goal:** A reusable, secure upload service + a tiny media library. Every content phase after this uses it.

### Session 2.1 — Upload API + storage service
- **Tasks**
  - Create `src/lib/upload.ts` — `saveUpload(file, userId)` → validates MIME (png/jpeg/webp), generates path via `upload-path.ts`, writes to disk, optimizes with `sharp` (max width 1600, quality 80, webp output), inserts an `UploadedImage` row, returns `{ path, width, height, size }`.
  - Create `src/app/api/admin/upload/route.ts` — `POST` multipart, auth-gated, 5 MB limit, calls `saveUpload`.
  - Add `UploadedImage` model (id, filename, path, mimetype, size, width, height, uploadedById, createdAt).
- **Definition of Done**
  - `curl -F file=@x.png` with a valid session returns the public path; file exists in `public/uploads/...`.

### Session 2.2 — Reusable image picker component
- **Tasks**
  - Create `src/components/admin/image-picker.tsx` — a button that opens a shadcn Dialog; inside: drag-drop zone + recent uploads grid (fetches `/api/admin/uploads?limit=24`); selecting returns the path to the parent form.
  - Supports both "upload new" and "pick existing" flows.
- **Definition of Done**
  - Any future form can drop in `<ImagePicker value={...} onChange={...} />` and get a working image selector.

### Session 2.3 — Media library page
- **Tasks**
  - `src/app/admin/uploads/page.tsx` — grid of all uploads with delete (soft-delete: marks `deletedAt`) + copy-path button.
  - `src/app/api/admin/uploads/route.ts` — `GET` (paginated list), `DELETE` (soft delete).
- **Definition of Done**
  - Admin can browse, search, and remove uploaded images.

**Phase 2 exit criteria:** Any content form can attach images via a consistent picker. Storage is on local disk, ready to swap to S3 later.

---

## Phase 3 — Site Settings (Contact + Social)

**Goal:** Editable phone, email, address, and social-media links shown site-wide (footer + donate CTA). The simplest CRUD — good warmup for the pattern all other phases follow.

### Session 3.1 — SiteSettings model + API
- **Tasks**
  - Add `SiteSettings` model (singleton: one row, id = "singleton"). Fields: phone, altPhone, email, address, facebook, youtube, instagram, twitter, whatsapp, telegram, mapEmbed (string?), updatedAt.
  - Create `src/app/api/admin/settings/route.ts` — `GET` (return the singleton) + `PUT` (zod-validated update).
  - Create `src/lib/validations/settings.ts` — zod schema.
- **Definition of Done**
  - API returns + accepts settings JSON; invalid input returns 422 with field errors.

### Session 3.2 — Settings form page
- **Tasks**
  - `src/app/admin/settings/page.tsx` — server component loads current settings.
  - `src/components/admin/settings-form.tsx` — client form (shadcn Form) with sections: Contact, Social Links. On submit → `PUT /api/admin/settings` → toast → `revalidatePath('/')`.
- **Definition of Done**
  - Saving changes updates the public footer + donate CTA on next visit.

### Session 3.3 — Wire settings into public site
- **Tasks**
  - Update `src/components/sections/site-footer.tsx` + `donate-cta.tsx` to read from a new `/api/settings` (public, cached) endpoint instead of hardcoded values.
  - Add `/api/settings/route.ts` (public `GET`, `Cache-Control: s-maxage=60`).
- **Definition of Done**
  - Change a social link in admin → footer updates after revalidation.

**Phase 3 exit criteria:** Admin can edit all site-wide contact + social info; public footer/CTA reflect it live.

---

## Phase 4 — দুনিয়াবি মডিউল (Revenue Modules) Management

**Goal:** Full CRUD for revenue modules, each with description, "how it works", image, social links, funnel %, and ordering. The public Modules Funnel section reflects changes dynamically.

### Session 4.1 — Modules list page
- **Tasks**
  - `src/app/admin/modules/page.tsx` — server component fetches all modules ordered by `order`.
  - `src/components/admin/modules-table.tsx` — shadcn Table with columns: icon, name, funnel %, status, order, actions (edit/delete).
  - Drag-to-reorder using `@dnd-kit` (already installed) → `PATCH /api/admin/modules/reorder` with `{ids: [...]}`.
- **Definition of Done**
  - Admin sees the live list and can reorder; reordering persists.

### Session 4.2 — Create/Edit module form
- **Tasks**
  - `src/app/admin/modules/new/page.tsx` + `[id]/edit/page.tsx`.
  - `src/components/admin/module-form.tsx` — fields: name, slug (auto from name, editable), short description, `howItWorks` (textarea / simple markdown), funnel % (number 0–100), featured image (ImagePicker), social links (repeatable: type + url), status (active/inactive), icon (select from lucide names).
  - `src/lib/validations/module.ts` — zod schema.
  - `src/app/api/admin/modules/route.ts` — `POST` (create).
  - `src/app/api/admin/modules/[id]/route.ts` — `GET`, `PUT`, `DELETE`.
- **Definition of Done**
  - Admin can create a new module with all fields; it appears on the public `#how` section immediately after revalidation.

### Session 4.3 — Public dynamic impact + module detail
- **Tasks**
  - Verify `src/components/sections/modules-funnel.tsx` already reads from `/api/modules` (it does). Extend the API to return `socialLinks`, `howItWorks`, `featuredImage` so the public card can show a "বিস্তারিত" link.
  - Add a public module detail view: `src/app/modules/[slug]/page.tsx` — shows full description, how-it-works, image, social links. (This is a new public route — acceptable since it's part of the product, not the sandbox-only rule.)
  - Link the admin "how it works" → MDX render on the public page via `react-markdown`.
- **Definition of Done**
  - Adding/removing/reordering modules changes the public Modules Funnel section live; each module links to its detail page.

**Phase 4 exit criteria:** Admin fully controls the revenue-modules list; public site reflects every change including the dynamic count and total funnel %.

---

## Phase 5 — উম্মাহর প্রয়োজন (Ummah Needs) Management

**Goal:** Full CRUD for Ummah needs with image, target budget, bKash number, urgency, category. Foundation for Phase 6 (donations).

### Session 5.1 — Needs list + filters
- **Tasks**
  - `src/app/admin/needs/page.tsx` — server component with query params: `?status=active&category=madrasa&urgency=critical`.
  - `src/components/admin/needs-table.tsx` — columns: image, title, category, urgency, raised/target, donor count, status, actions.
  - Filter bar (shadcn Select) + search input.
- **Definition of Done**
  - Admin can filter/search; list shows live raised amounts (will grow in Phase 6).

### Session 5.2 — Create/Edit need form
- **Tasks**
  - `src/app/admin/needs/new/page.tsx` + `[id]/edit/page.tsx`.
  - `src/components/admin/need-form.tsx` — fields: title, slug, summary, description (markdown), category (select), urgency (select), location, beneficiary, targetAmount (number), image (ImagePicker), bKashNumber, bKashType (personal/merchant), status (active/funded/closed).
  - `src/lib/validations/need.ts`.
  - `src/app/api/admin/needs/route.ts` (POST) + `[id]/route.ts` (GET/PUT/DELETE).
- **Definition of Done**
  - Admin can publish a new need; it appears on the public `#needs` section.

### Session 5.3 — bKash display on public site
- **Tasks**
  - On the public NeedCard, add a "বিস্তারিত" button → opens a dialog (or a `src/app/needs/[slug]/page.tsx`) showing the full description + bKash number with a copy button + QR code (generate client-side).
  - "আমি দান করেছি" button → opens a small form so donors can *self-report* a donation (creates a `Donation` with `status='pending'`) — optional but useful; admin confirms in Phase 6.
- **Definition of Done**
  - Donor sees the bKash number + can copy it; self-reported donations land in the admin queue.

**Phase 5 exit criteria:** Admin can manage the full needs lifecycle; public shows needs with bKash info.

---

## Phase 6 — Donation Tracking & Live Progress

**Goal:** Record received donations against a need; auto-update `raisedAmount` + `donorCount`; public progress bars update live.

### Session 6.1 — Donation model + record API
- **Tasks**
  - Add `Donation` model: id, needId (FK), donorName, donorPhone?, amount, method (bkash/nagad/cash/bank), transactionId?, status (pending/confirmed/rejected), note?, receivedAt, confirmedById?, createdAt, updatedAt.
  - `src/lib/validations/donation.ts`.
  - `src/app/api/admin/donations/route.ts` — `POST` (create, default status `confirmed` if admin-created) + `GET` (filterable list).
  - `src/app/api/admin/donations/[id]/route.ts` — `PATCH` (confirm/reject pending ones).
  - On `POST` confirmed → transactionally increment `UmmahNeed.raisedAmount` and `donorCount` in a Prisma `$transaction`.
- **Definition of Done**
  - Recording a confirmed donation updates the need's raised amount atomically.

### Session 6.2 — Donations admin UI
- **Tasks**
  - `src/app/admin/donations/page.tsx` — table: donor, need, amount, method, txnId, status, date, actions.
  - "Record donation" button → opens a dialog form (select need, enter donor name, amount, method, txnId, date).
  - Pending donations (from public self-reports) shown with Confirm/Reject buttons.
  - Filter by need, method, status, date range.
- **Definition of Done**
  - Admin can record, confirm, reject, and filter donations.

### Session 6.3 — Live progress on public site
- **Tasks**
  - Refactor `src/components/sections/ummah-needs.tsx` to use **TanStack Query** (`useQuery`) with `refetchInterval: 15000` so progress bars auto-refresh every 15s.
  - Add a subtle "live" pulse indicator on the progress bar when an amount changes.
  - Optionally: a toast on the public site when a need reaches 100% (celebratory).
- **Definition of Done**
  - Admin records a donation → within 15s the public progress bar advances without a manual refresh.

**Phase 6 exit criteria:** Donations are tracked end-to-end; public sees live progress. This is the most impactful phase for donor trust.

---

## Phase 7 — চলমান গল্প (Developing Story) as a Blog

**Goal:** Use the existing `Project` + `ProjectUpdate` models as a blog — rich-text timeline updates, published/draft status, featured stories.

### Session 7.1 — Stories list + create
- **Tasks**
  - `src/app/admin/stories/page.tsx` — list of `Project` entries with: title, status (published/draft), update count, total raised, featured toggle, actions.
  - `src/components/admin/story-form.tsx` — fields: name, slug, description, location, targetAmount, featuredImage (ImagePicker), status, featured.
  - `src/lib/validations/story.ts`.
  - `src/app/api/admin/stories/route.ts` (POST) + `[id]/route.ts` (GET/PUT/DELETE).
- **Definition of Done**
  - Admin can create a story (project) and toggle publish/featured.

### Session 7.2 — Timeline updates with rich-text editor
- **Tasks**
  - `src/app/admin/stories/[id]/updates/page.tsx` — list of updates for a story, ordered by date.
  - `src/components/admin/update-form.tsx` — fields: date, title, body (MDXEditor — toolbar: bold, italic, headings, lists, image, link), image (ImagePicker), collectedAmount, neededAmount, published.
  - Configure `@mdxeditor/editor` with the image plugin (uploads via `/api/admin/upload`).
  - `src/app/api/admin/stories/[id]/updates/route.ts` (POST/GET) + `updates/[uid]/route.ts` (PUT/DELETE).
- **Definition of Done**
  - Admin can write a rich-text update with embedded images; it appears on the public `#story` timeline.

### Session 7.3 — Public story rendering + SEO
- **Tasks**
  - Ensure `src/components/sections/developing-story.tsx` renders the markdown body via `react-markdown` (already installed).
  - Add public per-story page `src/app/stories/[slug]/page.tsx` with full timeline + `generateMetadata` for SEO (OG tags, canonical).
  - Add `src/app/stories/page.tsx` — blog index listing all published stories as cards.
- **Definition of Done**
  - Each story has a shareable public URL; markdown renders correctly; OG preview works.

**Phase 7 exit criteria:** Admin can run the developing-story section as a full blog with rich content.

---

## Phase 8 — স্থায়ী প্রজেক্ট (Fixed Projects) Management

**Goal:** CRUD for fixed projects (madrasa / maktab / orphanage / clinic / mosque) with image gallery, beneficiaries, monthly cost.

### Session 8.1 — Fixed projects CRUD
- **Tasks**
  - `src/app/admin/projects/page.tsx` — list with: image, name, type, beneficiaries, monthly cost, active toggle, actions.
  - `src/components/admin/fixed-project-form.tsx` — fields: name, slug, type (select), description (markdown), location, beneficiaries, monthlyCost, establishedAt, image (ImagePicker), gallery (multi-image via ImagePicker — stores JSON array), isActive.
  - `src/lib/validations/fixed-project.ts`.
  - `src/app/api/admin/fixed-projects/route.ts` (POST) + `[id]/route.ts` (GET/PUT/DELETE).
- **Definition of Done**
  - Admin can add/edit/deactivate fixed projects; public `#projects` section reflects changes.

### Session 8.2 — Public project detail + gallery
- **Tasks**
  - `src/app/projects/[slug]/page.tsx` — full description, gallery carousel (shadcn Carousel already available), monthly cost breakdown, "সাপোর্ট করুন" CTA.
  - `src/app/projects/page.tsx` — index of all active fixed projects.
- **Definition of Done**
  - Each fixed project has a shareable public detail page with gallery.

**Phase 8 exit criteria:** Admin fully manages fixed projects with galleries; public has detail pages.

---

## Phase 9 — Dashboard & Analytics

**Goal:** A real admin home page showing the health of the platform at a glance.

### Session 9.1 — Dashboard stats cards
- **Tasks**
  - `src/app/admin/page.tsx` (replace placeholder) — server component aggregating:
    - Total raised this month / all time (sum of confirmed donations).
    - Active needs count + total target vs raised.
    - Active fixed projects + total monthly cost (org's monthly commitment).
    - Active revenue modules + total funnel %.
    - Published stories count.
  - Render as shadcn Cards in a responsive grid.
- **Definition of Done**
  - Dashboard loads in <500ms; numbers are real.

### Session 9.2 — Charts + recent activity
- **Tasks**
  - Use `recharts` (already installed) for:
    - Donations over last 30 days (area chart).
    - Raised vs target per active need (bar chart).
    - Donation method distribution (pie).
  - "Recent donations" table (last 10).
  - "Pending approvals" widget (pending donations + draft stories).
- **Definition of Done**
  - Dashboard is genuinely useful for day-to-day operations.

**Phase 9 exit criteria:** Admin opens to a meaningful overview, not a blank page.

---

## Phase 10 — Polish, Security & Production Deployment

**Goal:** Harden everything, then ship to the production server alongside the public site.

### Session 10.1 — Security hardening
- **Tasks**
  - Add `AuditLog` model + a `withAudit` wrapper around every admin mutation (who, action, target, payload hash, timestamp).
  - Rate-limit login (`/api/auth`) — 5 attempts / 15 min / IP.
  - Add CSRF protection to admin mutation routes (NextAuth built-in for same-origin + a custom header check).
  - Enforce zod validation on **every** admin API (audit + lint that none are missing).
  - Password policy: min 10 chars; bcrypt cost factor 12.
- **Definition of Done**
  - No admin endpoint accepts invalid input; all mutations are audited.

### Session 10.2 — Role-based access (editor vs super_admin)
- **Tasks**
  - Add a `requireRole(role)` server helper; gate `/admin/settings`, `/admin/modules`, user management to `super_admin`.
  - Editors can manage needs, donations, stories, projects only.
  - Sidebar hides disallowed links per role.
- **Definition of Done**
  - An editor account cannot change site settings or modules.

### Session 10.3 — Admin user management
- **Tasks**
  - `src/app/admin/users/page.tsx` — list + invite (email-based; first-login sets password) + role change + deactivate.
  - `src/app/api/admin/users/route.ts` + `[id]/route.ts` (super_admin only).
- **Definition of Done**
  - Super admin can manage the team.

### Session 10.4 — Production deployment
- **Tasks**
  - Run the production build (`npm run build` — uses `scripts/build.mjs`).
  - Set prod env vars: `DATABASE_URL` (MySQL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://nekirjhuri.org`, `ADMIN_BOOTSTRAP_EMAIL`.
  - Seed the first super_admin on the prod DB (one-time script, then disable).
  - Deploy the entire `.next/standalone/` folder (per the deployment guide — includes CSS/fonts/images).
  - Configure the reverse proxy to pass `/admin/*`, `/api/*`, `/auth/*` to the Node server (same origin — no extra config needed).
  - Smoke test: log in, create a need, record a donation, verify public site updates.
- **Definition of Done**
  - Admin panel live on the production domain; full end-to-end flow works.

**Phase 10 exit criteria:** Admin panel is secure, role-aware, and deployed. The platform is production-complete.

---

## 5. Cross-Cutting Concerns

### 5.1 Consistent admin CRUD pattern
Every content type (modules, needs, stories, projects) follows the same pattern:
1. List page (server component, query-param filters).
2. Create + Edit pages sharing one form component.
3. zod validation schema in `src/lib/validations/`.
4. API: `POST /api/admin/<resource>` + `GET/PUT/DELETE /api/admin/<resource>/[id]`.
5. `revalidatePath('/')` (and the section anchor) after every mutation.
6. Toast feedback (shadcn Sonner, already installed).

Build a reusable `ResourceDataTable` + `ResourceFormDialog` early (in Phase 4) to reduce boilerplate for later phases.

### 5.2 Image handling
- All images go through `ImagePicker` → `/api/admin/upload` → `public/uploads/`.
- `sharp` optimizes to webp at upload time.
- `next/image` is used everywhere on the public site (already is).
- A weekly cron (Phase 10, optional) deletes orphaned `UploadedImage` rows whose path isn't referenced by any content (run a Prisma scan).

### 5.3 Revalidation strategy
| Change | Action |
|--------|--------|
| Site settings | `revalidatePath('/', 'layout')` |
| Module create/edit/delete | `revalidatePath('/')` |
| Need create/edit/delete | `revalidatePath('/')` |
| Donation recorded | No revalidate — public polls every 15s via TanStack Query |
| Story/update published | `revalidatePath('/')` + `revalidatePath('/stories/[slug]')` |
| Fixed project change | `revalidatePath('/')` + `revalidatePath('/projects/[slug]')` |

### 5.4 i18n / language
The admin UI is primarily in **Bengali** (matching the site) with English technical labels where conventional (e.g., "Save", "Cancel"). Keep a single `src/lib/admin-strings.ts` map so future English support is easy.

### 5.5 Error handling
- Every API Route Handler wraps logic in `try/catch`, returns `{ error: string }` with appropriate status (400/401/403/404/422/500).
- Admin forms show field-level errors from zod + a top-level `<Alert variant="destructive">` for unexpected errors.

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Production build misses static assets (recurring) | High | High | Already fixed via `scripts/build.mjs`; admin build reuses the same script |
| bcrypt not available on server | Low | High | Use `bcryptjs` (pure JS) — no native build |
| Image uploads fill disk | Medium | Medium | `sharp` compression + 5 MB limit + orphan cleanup cron (Phase 10) |
| Donation double-counting (race) | Low | High | Use Prisma `$transaction` for donation + raisedAmount increment |
| Admin route accidentally public | Low | Critical | Middleware + NextAuth `withAuth` wrapper + integration test in Phase 10 |
| bKash number exposed to spam | Medium | Medium | Show only on the detail page (not list); optional: reveal-on-click with a checkbox |
| Rich-text XSS via MDX editor | Low | High | `react-markdown` doesn't execute scripts by default; sanitize with `rehype-sanitize` (add in Phase 7) |
| Seed admin password leaked | Medium | High | Force password change on first login (Phase 10) |

---

## 7. Final State (what you'll have at the end)

After completing all 10 phases, the নেকির ঝুড়ি platform will have:

### Public site (existing + enhanced)
- Hero, Concept, Dua, Policy sections (existing)
- **Ummah Needs** — live progress bars that auto-refresh when donations land
- **Developing Story** — full blog with rich-text timelines, per-story SEO pages
- **Fixed Projects** — gallery-enabled detail pages
- **Modules Funnel** — dynamically reflects admin-managed modules, each linkable to a detail page
- **Footer + Donate CTA** — admin-managed contact + social links
- bKash donation info with copy button + QR

### Admin panel (`/admin`)
- Secure login (NextAuth, JWT, bcrypt, rate-limited)
- Dashboard with real stats + charts
- CRUD for: revenue modules, Ummah needs, donations, stories + updates, fixed projects, site settings, media library, admin users
- Role-based access (super_admin / editor)
- Audit log of every mutation
- Image upload + media library with optimization
- Rich-text editor for blog content

### Operations
- Single `npm run build` produces a deployable standalone folder (CSS/fonts/images included)
- Deployable to any Ubuntu VPS with Node + MySQL (per `upload/ChowdhuryBari_Deployment_Guide.md`)
- Backups via `mysqldump` cron
- Zero-downtime restarts via PM2/systemd

---

## 8. Effort Estimate (rough)

| Phase | Sessions | Est. hours | Can parallelize? |
|-------|----------|-----------|------------------|
| 0 — Foundation | 4 | 6–8 | No (base for all) |
| 1 — Auth & Shell | 3 | 5–7 | No |
| 2 — Uploads | 3 | 5–7 | No (base for content) |
| 3 — Site Settings | 3 | 3–4 | Yes (after 1) |
| 4 — Modules | 3 | 6–8 | Yes (after 2) |
| 5 — Needs | 3 | 6–8 | Yes (after 2) |
| 6 — Donations | 3 | 6–8 | After 5 |
| 7 — Blog/Stories | 3 | 7–9 | Yes (after 2) |
| 8 — Fixed Projects | 2 | 4–5 | Yes (after 2) |
| 9 — Dashboard | 2 | 4–5 | After 4–8 |
| 10 — Polish & Deploy | 4 | 8–10 | After 9 |
| **Total** | **33** | **~60–80** | — |

A single focused developer can finish in ~3–4 weeks part-time, or ~2 weeks full-time. With 2 developers after Phase 2, cut to ~10 days.

---

## 9. How to Start

1. **Read this plan end-to-end** before writing any code.
2. Create a new git branch: `git checkout -b feat/admin-panel`.
3. Start **Phase 0, Session 0.1** — add the `AdminUser` model and auth config.
4. Commit after each session with the convention: `admin(phase-x.y): <summary>`.
5. Open a PR per phase (not per session) for review.
6. Merge to `main` only after the phase's exit criteria pass.
7. After Phase 10, tag a release: `git tag v1.1.0-admin` and deploy.

---

*This document is the single source of truth for the admin panel build. Update it as decisions change — do not let it drift from the code.*
