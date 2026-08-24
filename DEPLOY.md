# নেকির ঝুড়ি — Deployment Guide

## One-Command Deployment

```bash
cd /var/www/nekirjhuri.com
./deploy.sh
```

That's it. The `deploy.sh` script handles everything:
- Git pull
- Dependency install (bun)
- Prisma client generation
- Database migrations (safe, non-destructive)
- Production build (standalone)
- PM2 restart (only after successful build)
- Health check

---

## What deploy.sh Does (in order)

1. **Verifies prerequisites** — checks for git, bun, node, pm2, .env
2. **Verifies env vars** — DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (values not printed)
3. **Pulls latest code** — `git pull origin main`
4. **Installs dependencies** — `bun install --frozen-lockfile`
5. **Generates Prisma client** — `bunx prisma generate`
6. **Runs migrations** — `bunx prisma migrate deploy` (safe, non-destructive)
7. **Builds** — `bun run build` (scripts/build.mjs)
8. **Restarts PM2** — `pm2 restart nekirjhuri --update-env`
9. **Health check** — `curl http://localhost:3000/api/health`

If any step fails, the script stops immediately. The running application is NOT affected.

---

## Safety Guarantees

- **.env is NEVER overwritten** — it's in .gitignore and deploy.sh only reads it
- **uploads/ is NEVER deleted** — it's outside .next/standalone, gitignored, persistent
- **Database is NEVER reset** — `prisma migrate deploy` only applies pending migrations
- **No destructive commands** — no `prisma db reset`, no `prisma db push --accept-data-loss`, no `DROP TABLE`

---

## How Migrations Work

### Prisma Migration System

The project uses Prisma's proper migration system:

```
prisma/migrations/
└── 0001_initial/
    └── migration.sql    # Full schema (all 10 tables)
```

- `prisma migrate deploy` applies pending migrations in order
- Each migration is recorded in the `_prisma_migrations` table
- Migrations are idempotent — running deploy.sh twice applies nothing the second time

### Creating New Migrations (for developers)

When you change `prisma/schema.prisma`, create a new migration:

```bash
bunx prisma migrate dev --name descriptive_name --create-only
```

This creates a new migration file WITHOUT applying it. Review the SQL, then commit it. On the server, `deploy.sh` will apply it automatically.

**Never use `prisma migrate dev` on the production server.** It's for local development only.

---

## How Uploads Are Preserved

```
/var/www/nekirjhuri.com/
├── .next/standalone/     # Rebuilt on every deploy (disposable)
├── uploads/              # NEVER touched by deploy (persistent)
│   └── 2025/01/uuid.webp
├── .env                  # NEVER overwritten (gitignored)
├── deploy.sh
└── ecosystem.config.cjs
```

Uploaded images are stored in `/var/www/nekirjhuri.com/uploads/` (set via `UPLOAD_DIR` in .env). The catch-all route at `/uploads/[...path]` serves them. This directory survives rebuilds, PM2 restarts, and git pulls.

---

## PM2 Configuration

PM2 is configured via `ecosystem.config.cjs`:

```javascript
{
  name: "nekirjhuri",
  script: ".next/standalone/server.js",
  cwd: "/var/www/nekirjhuri.com",
  env: { NODE_ENV: "production" },
  autorestart: true,
  max_restarts: 10,
}
```

Logs are at `/var/log/nekirjhuri/`. Useful commands:

```bash
pm2 status                    # Check if running
pm2 logs nekirjhuri --lines 50  # View recent logs
pm2 restart nekirjhuri         # Manual restart
pm2 stop nekirjhuri            # Stop
pm2 delete nekirjhuri          # Remove from PM2
```

---

## Health Check

The app has a `/api/health` endpoint that:
- Verifies the Next.js server is responding
- Verifies the database connection is alive (lightweight COUNT query)

```bash
curl http://localhost:3000/api/health
# {"status":"ok","database":"connected"}
```

deploy.sh automatically checks this after PM2 restart. If it fails, deploy.sh shows PM2 status + logs and exits with error.

---

## Rollback Procedure

### Application Rollback (safe, no DB changes)

```bash
cd /var/www/nekirjhuri.com

# Find the previous commit
git log --oneline -5

# Checkout the previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
bun install --frozen-lockfile
bunx prisma generate
bun run build
pm2 restart nekirjhuri --update-env

# Verify
curl http://localhost:3000/api/health
```

### Database Rollback (DANGEROUS — manual approval required)

Database migrations are NOT automatically reversible. If a migration added a column, rolling back means dropping it (data loss).

To roll back a migration:
1. Create a new migration that reverses the change (e.g., `ALTER TABLE ... DROP COLUMN`)
2. Commit it
3. Run `./deploy.sh`

**Never use `prisma migrate reset` on production.**

---

## If Deployment Fails

1. **Build fails:** The running app is NOT restarted. Check the error output.
2. **Migration fails:** The running app is NOT restarted. Check the migration SQL.
3. **PM2 restart fails:** Check `pm2 logs nekirjhuri`.
4. **Health check fails:** Check `pm2 status` and `pm2 logs nekirjhuri --lines 50`.

To manually restart the previous build:
```bash
pm2 restart nekirjhuri --update-env
```

---

## First-Time Setup (one-time only)

If setting up a fresh server:

```bash
# 1. Clone the repo
git clone https://github.com/sajidchowdhury/nekirjhuri.git /var/www/nekirjhuri.com
cd /var/www/nekirjhuri.com

# 2. Create .env from .env.example
cp .env.example .env
# Edit .env with production values (DATABASE_URL, NEXTAUTH_SECRET, etc.)

# 3. Create uploads directory
mkdir -p uploads

# 4. Install dependencies
bun install

# 5. Generate Prisma client
bunx prisma generate

# 6. Run migrations (creates all tables)
bunx prisma migrate deploy

# 7. Seed content + admin
bun run seed
bun run seed:admin

# 8. Build
bun run build

# 9. Start PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# 10. Configure reverse proxy (Nginx/Caddy) with SSL

# 11. Verify
curl http://localhost:3000/api/health
```

After first-time setup, all future updates use only:
```bash
./deploy.sh
```
