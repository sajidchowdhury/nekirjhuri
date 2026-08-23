# নেকির ঝুড়ি — Deployment Information Sheet

> Complete deployment reference for the নেকির ঝুড়ি (Basket of Good Deeds) platform.
> A faith-driven Islamic charity website presenting the concept, Ummah needs, developing project stories, and fixed running projects.

---

## 1. Project Name

**নেকির ঝুড়ি (Nekir Jhuri)** — A modern, Islamic, responsive single-page website for a faith-driven "farm whose owner is Allah". The platform coordinates revenue modules that feed a "good-deeds funnel" flowing from dunya to akhirah. It presents the mission concept, posts urgent Ummah needs (madrasa / student / medical / family / emergency relief), shows developing project stories with timelines, and lists fixed running projects (madrasa / maktab / orphanage).

---

## 2. Domain Name

Not hardcoded in the repository. The app uses relative paths everywhere, so it works under any domain once `NEXT_PUBLIC_SITE_URL` is set. You need to provide your own domain, for example:

```
nekirjhuri.org
www.nekirjhuri.org
```

---

## 3. GitHub Repository

```
https://github.com/<your-org>/nekir-jhuri
```

> Replace `<your-org>` with the actual GitHub organization/user once the repo is pushed.

---

## 4. Branch to Deploy

**`main`** — The production branch. All production deployments should be built from `main`. Feature work happens on feature branches and is merged via pull requests.

---

## 5. Application Type

**Next.js 16 (App Router)** — Specifically:

- **Next.js 16.1.x** with App Router + Turbopack
- **React 19** + **TypeScript 5** (strict)
- **Prisma ORM 6** — Database layer (SQLite in development, MySQL-portable for production)
- **Tailwind CSS 4** + **shadcn/ui** (New York style) + **Lucide icons**
- **Server-side rendering** for static content + **Route Handlers** (`/api/*`) for data
- **z-ai-web-dev-sdk** — Used only server-side for AI image generation / vision features
- **next/font** — Bengali (Hind Siliguri, Anek Bangla) + Arabic (Amiri) fonts

> ⚠️ **Note on Laravel:** This project is **NOT** Laravel-based. It is a Next.js application. Prisma ORM is used instead of Eloquent, and Next.js Route Handlers replace Laravel controllers. The database schema is defined in `prisma/schema.prisma` and is fully portable to MySQL by changing the Prisma `provider`.

---

## 6. Required Runtime

| Runtime | Version | Source |
|---------|---------|--------|
| **Node.js** | **20.x LTS or 22.x LTS** (≥ 20.9) | `package.json` engines / Next 16 requirement |
| **npm** | **10.x+** | ships with Node 20+ |
| **Bun** *(optional, recommended)* | **1.3.x+** | `package.json` scripts use `bun` |
| **Prisma CLI** | **6.x** (installed locally) | `package.json` devDependencies |

> The project ships with Bun lockfile (`bun.lock`) and uses `bun` in its npm scripts, but standard `npm`/`node` also works. Pick one and be consistent on the server.

### Verify

```bash
node -v          # v20.x or v22.x
npm -v           # 10.x+
bun -v           # 1.3.x+ (if using bun)
```

### Required Node Features

- Native ESM
- `fetch` global (Node 18+ has it built-in)
- No native PHP/Composer required — this is a pure JavaScript/TypeScript project

---

## 7. Database

**MySQL 8.0+ / MariaDB 10.6+** for production (recommended), **SQLite** for development.

- The Prisma schema (`prisma/schema.prisma`) currently uses `sqlite` provider for local development
- For production, switch the provider to `mysql` and set `DATABASE_URL` to a MySQL connection string
- All schema field types are MySQL-compatible (no SQLite-only types are used)
- The database stores: `UmmahNeed`, `Project`, `ProjectUpdate`, `FixedProject`, `RevenueModule`

### Switching to MySQL for production

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Then regenerate the client and push the schema:

```bash
npx prisma generate
npx prisma db push   # or: npx prisma migrate deploy
```

---

## 8. Required Database Name

```
nekirjhuri
```

Create it on the server:

```sql
CREATE DATABASE nekirjhuri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 9. Required Database User

A dedicated user with privileges scoped to the `nekirjhuri` database only:

```sql
CREATE USER 'nekirjhuri'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON nekirjhuri.* TO 'nekirjhuri'@'localhost';
FLUSH PRIVILEGES;
```

The `DATABASE_URL` environment variable then takes the form:

```
DATABASE_URL="mysql://nekirjhuri:STRONG_PASSWORD_HERE@localhost:3306/nekirjhuri"
```

---

## 10. Required Redis

**Not required.** The application uses local in-memory caching only. No Redis dependency exists.

If you later add session storage or heavy caching, Redis 7+ can be introduced — but the current build runs without it.

---

## 11. Required Queues/Workers

**Not required.** All current operations are synchronous request/response through Next.js Route Handlers. There is no background job queue.

> Future note: If AI image generation or bulk email sending is added later, consider a queue (e.g. a separate mini-service or `bullmq` + Redis). Not needed today.

---

## 12. Required Cron/Scheduler Jobs

**Not required currently.** The site is purely request-driven.

> Optional future cron: a daily job to mark expired `UmmahNeed` entries as `closed`, or to recompute aggregate stats. If added, schedule via the OS `crontab`:

```cron
0 3 * * * cd /var/www/nekirjhuri && /usr/bin/node scripts/close-expired-needs.mjs >> /var/log/nekirjhuri-cron.log 2>&1
```

---

## 13. Required Ports

| Port | Purpose | Exposed publicly? |
|------|---------|-------------------|
| **3000** | Next.js production server (`next start` or standalone server) | **No** — behind reverse proxy |
| **80** | Nginx/Caddy HTTP (redirects to 443) | Yes |
| **443** | Nginx/Caddy HTTPS (terminates SSL, proxies to :3000) | Yes |
| **3306** | MySQL | **No** — localhost only |

The Next.js app must listen on port 3000 internally. The reverse proxy (Nginx or Caddy) terminates SSL and forwards to `127.0.0.1:3000`.

---

## 14. Required Environment Variables

Create a `.env` file in the project root on the server (never commit this file). A `.env.example` should be provided; the production `.env` contains real secrets.

### Core Application

```env
# Base URL of the deployed site (used for SEO, OG tags, sitemap)
NEXT_PUBLIC_SITE_URL="https://nekirjhuri.org"

# Node environment
NODE_ENV="production"
```

### Database

```env
# MySQL (production)
DATABASE_URL="mysql://nekirjhuri:STRONG_PASSWORD_HERE@localhost:3306/nekirjhuri"

# SQLite (development fallback) — DO NOT use in production
# DATABASE_URL="file:./db/custom.db"
```

### AI Services (optional — only if regenerating images on server)

```env
# z-ai-web-dev-sdk credentials (used server-side only for image generation / vision)
# Obtain from the Z.ai console
ZAI_API_KEY="your-zai-api-key"
```

> If images are pre-generated and committed to `/public/images` (as in the current build), the AI key is **not** required for the site to run.

### Mini-services (if used)

```env
# Only if you add a WebSocket mini-service later; not required for the base website
# WS_SERVICE_PORT=3003
```

---

## 15. Build Command

Using **Bun** (recommended, matches development):

```bash
# 1. Install dependencies
bun install --frozen-lockfile

# 2. Generate Prisma client (after switching provider to mysql)
bunx prisma generate

# 3. Build the production bundle (standalone output)
bun run build
```

Using **npm**:

```bash
npm ci
npx prisma generate
npm run build
```

The `next.config.ts` is configured with `output: "standalone"`, which produces a self-contained server in `.next/standalone/` with only the needed `node_modules`. After build, copy the static + public assets:

```bash
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

---

## 16. Start Command

The production server runs from the standalone output:

```bash
# Using the standalone server (smallest footprint, recommended)
NODE_ENV=production node .next/standalone/server.js
```

Or, if you prefer the standard Next.js start (larger, simpler):

```bash
bun run start
# or: npx next start -p 3000
```

The server listens on **port 3000** by default. To override:

```bash
PORT=3000 node .next/standalone/server.js
```

### Running it persistently (choose one — see §24/§25)

- **PM2** (recommended, simplest):
  ```bash
  pm2 start "node .next/standalone/server.js" --name nekirjhuri --env production
  pm2 save
  pm2 startup
  ```
- **systemd** (no extra dependencies): see §25.

---

## 17. Public/Web Root

Next.js does not use a traditional `public/` document root like PHP. The entry point is the Node server process.

- **Reverse proxy root:** the Nginx/Caddy config points to `http://127.0.0.1:3000`
- **Static assets:** served by Next.js itself from `.next/standalone/.next/static/` and `.next/standalone/public/`
- **Application directory on server:** `/var/www/nekirjhuri`

The only user-visible route is `/` (defined in `src/app/page.tsx`). There is no `/admin` or other public path — API routes under `/api/*` are internal data endpoints.

---

## 18. Storage Requirements

- **Disk:** ~500 MB minimum (Node + dependencies + build output + uploaded images)
- **Application code + deps:** ~300 MB after `bun install` / `npm ci`
- **Build output:** ~150 MB (`.next/standalone` + static)
- **Database:** negligible at launch (< 10 MB); allow headroom for growth
- **Images:** AI-generated images live in `/public/images` (~1 MB total currently). If users upload images later, allocate `/var/www/nekirjhuri/public/uploads` with write permissions for the app user.

---

## 19. Upload Requirements

Currently there is **no user-facing file upload**. All images are pre-generated and committed.

If you later add an admin panel to upload need/project images:

- Store uploads **outside** the app directory (e.g. `/var/www/nekirjhuri-storage`) and serve via a reverse-proxy location block, **or**
- Store in `public/uploads/` and re-sync after each deploy (simpler, but uploads are lost on rollback)
- Recommended: configure Prisma to store only the image **path** in the DB, and the binary on disk / object storage
- Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`
- Max file size: 2 MB per image

---

## 20. SSL/HTTPS Requirements

**Required in production.** The site handles donation-related content and must be served over HTTPS.

### Using Caddy (automatic Let's Encrypt — simplest)

```caddyfile
nekirjhuri.org, www.nekirjhuri.org {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
```

Caddy auto-provisions and auto-renews certificates.

### Using Nginx + Certbot

```nginx
server {
    listen 80;
    server_name nekirjhuri.org www.nekirjhuri.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nekirjhuri.org www.nekirjhuri.org;

    ssl_certificate     /etc/letsencrypt/live/nekirjhuri.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nekirjhuri.org/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Cache static Next.js assets aggressively
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

Issue the certificate:

```bash
sudo certbot --nginx -d nekirjhuri.org -d www.nekirjhuri.org
```

---

## 21. WebSocket Requirements

**Not required** for the base website. The site is fully functional over HTTP/HTTPS request/response.

If a real-time feature (e.g. live donation counter) is added later, a separate Socket.io mini-service can be deployed on another port (e.g. 3003) and fronted by the same reverse proxy using the `XTransformPort` query convention used in this environment. Not needed today.

---

## 22. External APIs/Services

| Service | Required? | Purpose |
|---------|-----------|---------|
| **z-ai-web-dev-sdk** (Z.ai) | Optional | AI image generation & vision. Only needed if regenerating images server-side. The site ships with pre-generated images, so this is optional for production runtime. |
| **Payment gateway** (bKash / SSL Commerz / Stripe) | Future | Not integrated yet. When donation checkout is added, credentials will go in `.env`. |
| **Email/SMTP** | Future | For donation receipts / notifications. Not integrated yet. |

No external API keys are required for the site to **boot and serve** today.

---

## 23. Whether Docker is Required

**Not required**, but **optional and recommended** for reproducible deploys.

### Optional Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

A plain VPS install (Bun/npm + PM2) is equally valid and simpler for a single-server deploy.

---

## 24. Whether Supervisor is Required

**Not required.** Use **PM2** (the Node.js ecosystem equivalent of Supervisor) instead — it is lighter and built for Node processes.

```bash
sudo npm install -g pm2
pm2 start "node .next/standalone/server.js" --name nekirjhuri
pm2 startup systemd
pm2 save
```

PM2 handles auto-restart, log rotation, and crash recovery.

---

## 25. Whether systemd is Required

**Not required**, but recommended as the zero-dependency alternative to PM2.

### systemd unit: `/etc/systemd/system/nekirjhuri.service`

```ini
[Unit]
Description=নেকির ঝুড়ি Next.js App
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nekirjhuri
EnvironmentFile=/var/www/nekirjhuri/.env
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/nekirjhuri/app.log
StandardError=append:/var/log/nekirjhuri/error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo mkdir -p /var/log/nekirjhuri
sudo systemctl daemon-reload
sudo systemctl enable nekirjhuri
sudo systemctl start nekirjhuri
sudo systemctl status nekirjhuri
```

---

## 26. Expected Production Process

### Initial Deployment (fresh server)

Run as a non-root sudo user on a clean Ubuntu 22.04 / 24.04 VPS.

```bash
# 1. System prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# 2. Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. MySQL 8
sudo apt install -y mysql-server
sudo mysql_secure_installation

# 4. Create database + user
sudo mysql <<SQL
CREATE DATABASE nekirjhuri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nekirjhuri'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG';
GRANT ALL PRIVILEGES ON nekirjhuri.* TO 'nekirjhuri'@'localhost';
FLUSH PRIVILEGES;
SQL

# 5. Clone the repo
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
git clone https://github.com/<your-org>/nekir-jhuri.git /var/www/nekirjhuri
cd /var/www/nekirjhuri

# 6. Switch Prisma to MySQL
# Edit prisma/schema.prisma: provider = "mysql"

# 7. Create .env
cp .env.example .env
# Edit .env: set DATABASE_URL, NEXT_PUBLIC_SITE_URL

# 8. Install + build
npm ci
npx prisma generate
npx prisma db push
npm run seed        # if a seed script exists: node prisma/seed.ts
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 9. Run with PM2
pm2 start "node .next/standalone/server.js" --name nekirjhuri --env production
pm2 save
pm2 startup

# 10. Reverse proxy + SSL (Caddy shown — simplest)
sudo apt install -y caddy
# Edit /etc/caddy/Caddyfile with the block from §20
sudo systemctl restart caddy

# 11. Set permissions
sudo chown -R www-data:www-data /var/www/nekirjhuri
```

### Ongoing Production Processes

- **Code update:** pull `main`, rebuild, restart PM2 (see Quick Deploy below)
- **Certificate renewal:** automatic (Caddy) or via `certbot renew` cron (Nginx)
- **Log rotation:** PM2自带; for systemd use `logrotate`
- **Database backups:** nightly `mysqldump` cron

### Quick Deploy Commands

Save as `/var/www/nekirjhuri/deploy.sh`:

```bash
#!/usr/bin/env bash
set -e
cd /var/www/nekirjhuri

echo "→ Pulling latest code…"
git pull origin main

echo "→ Installing dependencies…"
npm ci

echo "→ Regenerating Prisma client…"
npx prisma generate

echo "→ Applying schema changes…"
npx prisma db push

echo "→ Building…"
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

echo "→ Restarting app…"
pm2 restart nekirjhuri --update-env

echo "✅ Deploy complete"
```

Make executable: `chmod +x deploy.sh`. Run: `./deploy.sh`.

### Post-Deployment Verification

```bash
# App is up
pm2 status
curl -I https://nekirjhuri.org            # expect 200

# API endpoints respond
curl -s https://nekirjhuri.org/api/needs          | head -c 200
curl -s https://nekirjhuri.org/api/projects       | head -c 200
curl -s https://nekirjhuri.org/api/fixed-projects | head -c 200
curl -s https://nekirjhuri.org/api/modules        | head -c 200

# DB connectivity
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM UmmahNeed;"

# Logs
pm2 logs nekirjhuri --lines 50
```

### Smoke Test URLs

| URL | Expected |
|-----|----------|
| `https://nekirjhuri.org/` | 200 — full single-page site renders with hero, concept, dua, needs, story, fixed projects, modules, footer |
| `https://nekirjhuri.org/#needs` | Donation needs section with cards + category filters |
| `https://nekirjhuri.org/#story` | Developing story timeline with project switcher |
| `https://nekirjhuri.org/#projects` | Fixed running projects (madrasa/maktab/orphanage) |
| `https://nekirjhuri.org/api/needs` | JSON `{ "needs": [...] }` |
| `https://nekirjhuri.org/api/projects` | JSON `{ "projects": [...] }` with updates |
| `https://nekirjhuri.org/api/fixed-projects` | JSON `{ "projects": [...] }` |
| `https://nekirjhuri.org/api/modules` | JSON `{ "modules": [...] }` |

---

## Appendix A — Server Minimum Specs

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCore | 2 vCore |
| RAM | 1 GB | 2 GB |
| Disk | 10 GB SSD | 20 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Bandwidth | 500 GB/mo | 1 TB/mo |

Suitable for a small VPS (e.g. DigitalOcean $6 droplet, Hetzner CX22, Vultr $6 plan).

---

## Appendix B — Project Structure (key files)

```
nekir-jhuri/
├── prisma/
│   ├── schema.prisma          # DB models (UmmahNeed, Project, ProjectUpdate, FixedProject, RevenueModule)
│   └── seed.ts                # Seed data (6 needs, 2 projects, 3 fixed projects, 4 modules)
├── src/
│   ├── app/
│   │   ├── page.tsx           # The single user-visible route (composes all sections)
│   │   ├── layout.tsx         # Root layout (Bengali + Arabic fonts, metadata)
│   │   ├── globals.css        # Islamic theme (emerald/gold/cream palette, patterns)
│   │   └── api/
│   │       ├── needs/route.ts
│   │       ├── projects/route.ts
│   │       ├── fixed-projects/route.ts
│   │       └── modules/route.ts
│   ├── components/sections/   # Header, Hero, Concept, SuccessVision, Policy, UmmahNeeds, DevelopingStory, FixedProjects, ModulesFunnel, DonateCta, SiteFooter
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   └── types.ts           # Shared types + BDT/percent helpers
│   └── components/ui/         # shadcn/ui component library
├── public/images/             # AI-generated images (hero, madrasa, students, well, pattern)
├── next.config.ts             # output: "standalone"
├── package.json
└── .env.example
```

---

## Appendix C — Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| UI | React 19 + shadcn/ui + Tailwind CSS 4 + Lucide |
| Fonts | next/font — Hind Siliguri, Anek Bangla, Amiri |
| Database | Prisma 6 → MySQL (prod) / SQLite (dev) |
| AI (optional) | z-ai-web-dev-sdk (image generation / vision, server-side only) |
| Process manager | PM2 or systemd |
| Reverse proxy | Caddy (auto-SSL) or Nginx + Certbot |
| Runtime | Node.js 20 LTS / 22 LTS |

---

*This guide assumes a single-server deploy. For multi-server or containerized (Kubernetes) setups, adapt §23 (Docker) and add a load balancer.*

---

## Appendix D — Troubleshooting: Missing Styles in Production

### Symptom

After deploying, the site renders as **unstyled HTML**:
- No emerald green / gold colors (everything is black text on white, or default browser colors)
- No custom fonts (Bengali shows in generic sans-serif, Arabic is invisible or wrong)
- Buttons appear as plain text or default gray buttons (no rounded corners, no background)
- Layout is squashed (no spacing between elements)
- Cards and sections have no backgrounds, shadows, or borders

### Root Cause

**Next.js `output: "standalone"` does NOT automatically include `.next/static/` (CSS, fonts, JS chunks) or `public/` (images) in the standalone output.** These must be copied manually after `next build`.

If you deployed only `.next/standalone/server.js` without copying these folders, the server renders HTML that references CSS/font files which **404** — so the browser gets unstyled HTML.

### The Fix

#### Option A — Use the built-in build script (recommended)

The project includes `scripts/build.mjs` which automates `next build` + the copy step + verification:

```bash
npm run build
# or
bun run build
```

This script:
1. Runs `next build`
2. Copies `.next/static/` → `.next/standalone/.next/static/` (CSS + fonts + JS)
3. Copies `public/` → `.next/standalone/public/` (images)
4. Verifies all critical files exist (CSS, fonts, JS chunks, images)
5. Prints a summary with file counts and sizes

**You must deploy the ENTIRE `.next/standalone/` folder**, not just `server.js`.

#### Option B — Manual copy (if you ran `next build` directly)

If you ran `npx next build` instead of `npm run build`, run these commands:

```bash
# Linux / macOS
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Windows (PowerShell)
Copy-Item -Path .next\static -Destination .next\standalone\.next\ -Recurse -Force
Copy-Item -Path public -Destination .next\standalone\ -Recurse -Force
```

### Verification

After building, verify the critical files exist:

```bash
# CSS file(s) must exist
ls .next/standalone/.next/static/css/*.css

# Font files must exist (.woff2)
ls .next/standalone/.next/static/media/*.woff2

# JS chunks must exist
ls .next/standalone/.next/static/chunks/ | head

# Images must exist
ls .next/standalone/public/images/
```

Then start the server and test:

```bash
NODE_ENV=production node .next/standalone/server.js &

# Check the HTML references a CSS file
curl -s http://localhost:3000 | grep -o '/_next/static/css/[^"]*\.css'

# Check the CSS file is actually served (should return CSS, not 404)
CSS_PATH=$(curl -s http://localhost:3000 | grep -o '/_next/static/css/[^"]*\.css' | head -1)
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${CSS_PATH}"
# Expected: 200  (if 404, the static folder is missing)

# Check a font file is served
FONT_PATH=$(curl -s http://localhost:3000 | grep -o '/_next/static/media/[^"]*\.woff2' | head -1)
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${FONT_PATH}"
# Expected: 200
```

### What to Deploy

Your deployment package should contain the **entire** `.next/standalone/` directory:

```
.next/standalone/
├── server.js                    ← Node server entry point
├── package.json
├── .next/
│   └── static/                  ← CSS + fonts + JS chunks (CRITICAL)
│       ├── css/
│       │   └── [hash].css       ← All Tailwind + custom styles
│       ├── media/
│       │   └── [hash].woff2     ← Hind Siliguri, Anek Bangla, Amiri fonts
│       └── chunks/
│           └── *.js             ← React + app code
├── public/                      ← Images, icons (CRITICAL)
│   └── images/
│       ├── hero.png
│       ├── madrasa.png
│       └── ...
└── node_modules/                ← Minimal deps (auto-included by standalone)
```

**Do NOT deploy only `server.js`.** Deploy the whole folder.

### Quick Deploy Checklist

- [ ] Ran `npm run build` (not just `npx next build`)
- [ ] `.next/standalone/.next/static/css/` contains at least one `.css` file
- [ ] `.next/standalone/.next/static/media/` contains `.woff2` font files
- [ ] `.next/standalone/public/images/` contains the AI-generated images
- [ ] Copied the **entire** `.next/standalone/` folder to the server
- [ ] Started with `NODE_ENV=production node .next/standalone/server.js`
- [ ] `curl http://localhost:3000` returns HTML with `/_next/static/css/*.css` references
- [ ] Those CSS URLs return `200` (not `404`)

