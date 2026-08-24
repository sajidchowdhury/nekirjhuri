# নেকির ঝুড়ি — Migration Guide: Adding Admin Panel to Live Site

> Your public website is already live. We've built a complete admin panel
> in the GitHub repo (https://github.com/sajidchowdhury/nekirjhuri).
> This guide shows you how to check the current status and deploy the
> admin panel to your live server.

---

## Step 1: Check Your Current Live Site Status

Before making any changes, check what's currently running on your server.

### 1.1 SSH into your server

```bash
ssh user@your-server-ip
```

### 1.2 Check what's running

```bash
# Check if Node/Next.js is running
pm2 status
# or
systemctl status nekirjhuri

# Check which port is in use
ss -tlnp | grep 3000

# Check the project directory
ls -la /var/www/nekirjhuri/
# (or wherever your site is deployed)

# Check the current .env
cat /var/www/nekirjhuri/.env

# Check the current Prisma schema
grep "^model" /var/www/nekirjhuri/prisma/schema.prisma
```

### 1.3 Take a backup BEFORE doing anything

```bash
# Backup the database
mysqldump -u nekirjhuri -p nekirjhuri > /tmp/nekirjhuri-backup-$(date +%Y%m%d).sql

# Backup the current code
cp -r /var/www/nekirjhuri /var/www/nekirjhuri-backup-$(date +%Y%m%d)

# Backup the .env file
cp /var/www/nekirjhuri/.env /tmp/nekirjhuri-env-backup
```

---

## Step 2: Clone the Repo (Local Testing First)

Before deploying to the server, test locally to make sure everything works.

### 2.1 Clone the repo

```bash
git clone https://github.com/sajidchowdhury/nekirjhuri.git
cd nekirjhuri
```

### 2.2 Install dependencies

```bash
bun install
# or: npm install
```

### 2.3 Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set these values:

```env
DATABASE_URL="file:./db/custom.db"

# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_BOOTSTRAP_EMAIL="admin@nekirjhuri.org"
```

### 2.4 Set up the database

```bash
# Push schema (creates all 10 tables including admin tables)
bunx prisma db push

# Seed content data (needs, projects, modules)
bun run seed

# Seed the bootstrap admin user
bun run seed:admin
```

After `seed:admin`, you'll see:
```
🔑 Login credentials:
   email:    admin@nekirjhuri.org
   password: NekirJhuri@2025
```

### 2.5 Run the dev server

```bash
bun run dev
```

### 2.6 Test locally

Open these URLs in your browser:

| URL | What to check |
|-----|---------------|
| `http://localhost:3000/` | Public site renders correctly |
| `http://localhost:3000/admin/login` | Login form appears |
| `http://localhost:3000/admin` | Redirects to login (if not logged in) |

**Login with:**
- Email: `admin@nekirjhuri.org`
- Password: `NekirJhuri@2025`

After login, you should see:
- ✅ Dashboard with stats + charts
- ✅ Sidebar with all sections
- ✅ Needs management (list, create, edit, delete)
- ✅ Donations tracking (record, confirm/reject)
- ✅ Stories/blog management
- ✅ Fixed projects with galleries
- ✅ Revenue modules with drag-reorder
- ✅ Site settings (phone, email, social links)
- ✅ Media library (upload, browse, delete)
- ✅ User management (create, role change, deactivate)

### 2.7 Run production build (verify it compiles)

```bash
bun run build
```

You should see:
```
✓ Compiled successfully
✓ CSS files: 2
✓ Font files: 24
✓ JS chunks: 50
✓ Public images: 5
✓ All assets verified. Ready to deploy!
```

---

## Step 3: Deploy to Your Live Server

Once local testing passes, deploy to the server.

### 3.1 SSH into your server

```bash
ssh user@your-server-ip
cd /var/www/nekirjhuri
```

### 3.2 Stop the current app

```bash
pm2 stop nekirjhuri
# or: systemctl stop nekirjhuri
```

### 3.3 Pull the latest code

If your server already has the repo:
```bash
git pull origin main
```

If not, clone it fresh:
```bash
git clone https://github.com/sajidchowdhury/nekirjhuri.git /var/www/nekirjhuri-new
cd /var/www/nekirjhuri-new
```

### 3.4 Update .env (ADD the new auth variables)

Edit your `.env` file and ADD these three lines (keep your existing DATABASE_URL):

```env
# Your existing DATABASE_URL stays the same
DATABASE_URL="mysql://nekirjhuri:your-password@localhost:3306/nekirjhuri"

# ADD these three new variables:
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"
ADMIN_BOOTSTRAP_EMAIL="admin@nekirjhuri.org"
```

> ⚠️ Generate a real secret: run `openssl rand -base64 32` on the server
> and paste the output as NEXTAUTH_SECRET. Do NOT use the dev value.

### 3.5 Install dependencies

```bash
npm ci
# or: bun install
```

### 3.6 Update the database schema

```bash
# Generate Prisma client (needed for new models)
npx prisma generate

# Push schema changes (adds AdminUser, UploadedImage, SiteSettings,
# Donation, AuditLog tables — non-breaking, your existing data stays)
npx prisma db push
```

### 3.7 Seed the admin user

```bash
npx bun run seed:admin
# or: bun run seed:admin
```

This creates the super_admin account:
```
email:    admin@nekirjhuri.org
password: NekirJhuri@2025
```

> ⚠️ CHANGE THIS PASSWORD immediately after first login!

### 3.8 Build for production

```bash
npm run build
# or: bun run build
```

This runs `scripts/build.mjs` which:
1. Runs `next build`
2. Copies CSS + fonts + JS to standalone
3. Copies public images to standalone
4. Verifies all critical files exist

### 3.9 Start the app

```bash
pm2 start "node .next/standalone/server.js" --name nekirjhuri --env production
pm2 save
```

Or if using systemd:
```bash
systemctl start nekirjhuri
```

### 3.10 Verify on the live server

Open these URLs:

| URL | Expected |
|-----|----------|
| `https://your-domain.com/` | Public site renders (same as before) |
| `https://your-domain.com/admin/login` | Login form appears |
| `https://your-domain.com/admin` | Redirects to login (if not logged in) |

**Login → Dashboard → verify stats + charts appear.**

---

## Step 4: Post-Deployment Checklist

- [ ] Public site renders correctly (styles, fonts, images)
- [ ] `/admin/login` shows the login form
- [ ] Login works with bootstrap credentials
- [ ] Dashboard shows stats + charts
- [ ] Sidebar shows all sections
- [ ] Needs list loads with existing data
- [ ] Donations page loads
- [ ] Stories page loads
- [ ] Fixed projects page loads
- [ ] Modules page loads
- [ ] Settings page loads (super_admin only)
- [ ] Media library loads
- [ ] User management loads (super_admin only)
- [ ] **Changed the bootstrap password** via `/admin/users`
- [ ] Created an editor user for daily content management
- [ ] Tested uploading an image via media library
- [ ] Tested creating a need + recording a donation → live progress updates
- [ ] Reverse proxy (Nginx/Caddy) passes `/admin/*` and `/api/*` correctly

---

## Step 5: Daily Operations

### How to update the site content:

1. Go to `https://your-domain.com/admin/login`
2. Login with your credentials
3. Use the sidebar to navigate:
   - **উম্মাহর প্রয়োজন** → Add/edit donation needs
   - **ডোনেশন** → Record received donations (progress bars update live!)
   - **চলমান গল্প** → Write blog posts with timeline updates
   - **স্থায়ী প্রজেক্ট** → Manage running madrasa/maktab/orphanage
   - **দুনিয়াবি মডিউল** → Manage revenue modules (super_admin)
   - **সাইট সেটিংস** → Change phone/email/social links (super_admin)
   - **মিডিয়া লাইব্রেরি** → Upload and manage images
   - **ইউজার ম্যানেজমেন্ট** → Create users, change roles (super_admin)

### How to deploy code updates:

```bash
cd /var/www/nekirjhuri
git pull origin main
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart nekirjhuri
```

Or use the deploy script:
```bash
./deploy.sh
```

---

## Quick Reference

### Login Credentials (change after first login!)
```
Email:    admin@nekirjhuri.org
Password: NekirJhuri@2025
```

### Key URLs
```
Public site:  https://your-domain.com/
Admin panel:  https://your-domain.com/admin/login
Stories blog: https://your-domain.com/stories
Projects:     https://your-domain.com/projects
```

### GitHub Repo
```
https://github.com/sajidchowdhury/nekirjhuri
```

### Full Deployment Guide
```
upload/ChowdhuryBari_Deployment_Guide.md
```

### Admin Panel Implementation Plan
```
upload/Admin_Panel_Implementation_Plan.md
```
