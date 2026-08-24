#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# নেকির ঝুড়ি — Production Deployment Script
# ============================================================
#
# Usage:
#   cd /var/www/nekirjhuri.com
#   ./deploy.sh
#
# This script:
#   1. Verifies prerequisites (.env, commands, directory)
#   2. Pulls latest code from Git
#   3. Installs dependencies (bun install)
#   4. Generates Prisma client
#   5. Runs database migrations (prisma migrate deploy — safe, non-destructive)
#   6. Builds the production bundle (standalone)
#   7. Restarts PM2 (only if build succeeded)
#   8. Performs a health check
#
# If any step fails, the script stops immediately and the running
# application is NOT affected (zero-downtime safe deployment).
#
# .env is NEVER overwritten.
# /uploads is NEVER deleted.
# Database is NEVER reset.
# ============================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project directory (where this script lives)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  নেকির ঝুড়ি — Production Deployment              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}→ Project directory: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}→ Start time: $(date)${NC}"
echo ""

# ============================================================
# STEP 1: Verify prerequisites
# ============================================================
echo -e "${CYAN}── Step 1: Verifying prerequisites ──${NC}"

# Check required commands
for cmd in git bun node pm2; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}✗ Required command not found: ${cmd}${NC}"
    echo -e "${RED}  Install it before deploying.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ ${cmd}: $(command -v "$cmd")${NC}"
done

# Check .env exists (NEVER create or overwrite it)
if [ ! -f ".env" ]; then
  echo -e "${RED}✗ .env file not found at ${PROJECT_DIR}/.env${NC}"
  echo -e "${RED}  Create it from .env.example with production values.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ .env exists (will NOT be overwritten)${NC}"

# Check uploads directory
if [ ! -d "uploads" ]; then
  echo -e "${YELLOW}⚠ uploads/ directory not found — creating it${NC}"
  mkdir -p uploads
fi
echo -e "${GREEN}✓ uploads/ directory exists${NC}"

# Verify required environment variables exist (values NOT printed)
REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" .env 2>/dev/null; then
    echo -e "${RED}✗ Required environment variable not set in .env: ${var}${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ ${var} is set${NC}"
done

echo ""

# ============================================================
# STEP 2: Pull latest code
# ============================================================
echo -e "${CYAN}── Step 2: Pulling latest code ──${NC}"

# Stash any local changes (shouldn't be any, but just in case)
STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${YELLOW}⚠ Local changes detected — stashing${NC}"
  git stash
  STASHED=true
fi

git pull origin main

# Pop stash if we stashed
if [ "$STASHED" = true ]; then
  echo -e "${YELLOW}⚠ Popping stashed changes${NC}"
  git stash pop || true
fi

echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# ============================================================
# STEP 3: Install dependencies
# ============================================================
echo -e "${CYAN}── Step 3: Installing dependencies ──${NC}"

bun install --frozen-lockfile 2>/dev/null || bun install

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================================
# STEP 4: Generate Prisma client
# ============================================================
echo -e "${CYAN}── Step 4: Generating Prisma client ──${NC}"

bunx prisma generate

echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# ============================================================
# STEP 5: Run database migrations (SAFE — non-destructive)
# ============================================================
echo -e "${CYAN}── Step 5: Running database migrations ──${NC}"

# Use prisma migrate deploy — this only applies pending migrations.
# It does NOT reset the database.
# It does NOT use prisma db push.
# It does NOT drop tables or columns.
bunx prisma migrate deploy

echo -e "${GREEN}✓ Database migrations applied${NC}"
echo ""

# ============================================================
# STEP 6: Build production bundle
# ============================================================
echo -e "${CYAN}── Step 6: Building production bundle ──${NC}"

# Run the custom build script (scripts/build.mjs)
# This runs next build + copies static assets + verifies them
bun run build

# Verify standalone server exists
if [ ! -f ".next/standalone/server.js" ]; then
  echo -e "${RED}✗ Build failed — standalone server.js not found${NC}"
  echo -e "${RED}  The running application has NOT been restarted.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Production build complete${NC}"
echo ""

# ============================================================
# STEP 7: Restart PM2 (only after successful build)
# ============================================================
echo -e "${CYAN}── Step 7: Restarting PM2 ──${NC}"

# Check if PM2 process exists
if pm2 describe nekirjhuri &>/dev/null; then
  pm2 restart nekirjhuri --update-env
  echo -e "${GREEN}✓ PM2 process restarted${NC}"
else
  # Start fresh using ecosystem config
  pm2 start ecosystem.config.cjs --env production
  pm2 save
  echo -e "${GREEN}✓ PM2 process started (new)${NC}"
fi

echo ""

# ============================================================
# STEP 8: Health check
# ============================================================
echo -e "${CYAN}── Step 8: Health check ──${NC}"

# Wait for server to start
sleep 3

HEALTH_URL="http://localhost:3000/api/health"
MAX_RETRIES=5
RETRY_DELAY=3
HEALTHY=false

for i in $(seq 1 $MAX_RETRIES); do
  echo -e "${YELLOW}  Attempt ${i}/${MAX_RETRIES}...${NC}"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    HEALTHY=true
    echo -e "${GREEN}✓ Health check passed (HTTP 200)${NC}"
    break
  fi

  if [ "$i" -lt "$MAX_RETRIES" ]; then
    echo -e "${YELLOW}  Got HTTP ${HTTP_CODE}, retrying in ${RETRY_DELAY}s...${NC}"
    sleep $RETRY_DELAY
  fi
done

if [ "$HEALTHY" = false ]; then
  echo -e "${RED}✗ Health check failed after ${MAX_RETRIES} attempts${NC}"
  echo -e "${YELLOW}  PM2 status:${NC}"
  pm2 status
  echo ""
  echo -e "${YELLOW}  Recent PM2 logs (last 30 lines):${NC}"
  pm2 logs nekirjhuri --lines 30 --nostream
  exit 1
fi

echo ""

# ============================================================
# STEP 9: Deployment summary
# ============================================================
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✅ Deployment Complete                          ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  Time: $(date)              ║${NC}"
echo -e "${CYAN}║  PM2:  nekirjhuri (running)                      ║${NC}"
echo -e "${CYAN}║  App:  http://localhost:3000                     ║${NC}"
echo -e "${CYAN}║  .env: preserved (not overwritten)               ║${NC}"
echo -e "${CYAN}║  uploads/: preserved                             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
