#!/usr/bin/env node
/**
 * নেকির ঝুড়ি — Production Build Script
 *
 * This script wraps `next build` and ensures the standalone output
 * includes ALL required static assets (CSS, fonts, JS chunks, public/).
 *
 * ROOT CAUSE THIS FIXES:
 * Next.js `output: "standalone"` produces `.next/standalone/server.js`
 * but does NOT automatically copy `.next/static/` (CSS + fonts + JS)
 * or `public/` (images) into the standalone folder. If you deploy only
 * the standalone folder without these, the site renders as UNSTYLED HTML
 * (no colors, no fonts, no Tailwind, no custom CSS).
 *
 * This script automates the copy + verification so it can never be missed.
 * Works cross-platform (Linux, macOS, Windows) — uses Node fs, not `cp`.
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const NEXT_DIR = join(ROOT, ".next");
const STANDALONE_DIR = join(NEXT_DIR, "standalone");
const STANDALONE_NEXT = join(STANDALONE_DIR, ".next");
const STANDALONE_PUBLIC = join(STANDALONE_DIR, "public");

const STATIC_DIR = join(NEXT_DIR, "static");
const PUBLIC_DIR = join(ROOT, "public");

function log(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}
function warn(msg) {
  console.log(`\x1b[33m⚠\x1b[0m ${msg}`);
}
function err(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
}
function header(msg) {
  console.log(`\n\x1b[1m\x1b[36m── ${msg} ──\x1b[0m`);
}

function dirSize(dir) {
  let total = 0;
  if (!existsSync(dir)) return 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const stat = statSync(p);
    if (stat.isDirectory()) total += dirSize(p);
    else total += stat.size;
  }
  return total;
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ---------- 1. Run next build ----------
header("Building Next.js (standalone)");
try {
  execSync("npx next build", { stdio: "inherit", cwd: ROOT });
} catch {
  err("next build failed. Aborting.");
  process.exit(1);
}

// ---------- 2. Verify standalone output exists ----------
header("Verifying standalone output");
if (!existsSync(STANDALONE_DIR)) {
  err(`Standalone directory not found: ${STANDALONE_DIR}`);
  err("Ensure next.config.ts has: output: \"standalone\"");
  process.exit(1);
}
if (!existsSync(join(STANDALONE_DIR, "server.js"))) {
  err("server.js not found in standalone output.");
  process.exit(1);
}
log("Standalone server.js found");

// ---------- 3. Copy .next/static → standalone/.next/static ----------
header("Copying static assets (CSS, fonts, JS chunks)");
if (!existsSync(STATIC_DIR)) {
  err(`Static directory not found: ${STATIC_DIR}`);
  err("This usually means the build did not complete properly.");
  process.exit(1);
}

// Ensure standalone/.next exists
if (!existsSync(STANDALONE_NEXT)) {
  mkdirSync(STANDALONE_NEXT, { recursive: true });
}

// Copy static
cpSync(STATIC_DIR, join(STANDALONE_NEXT, "static"), {
  recursive: true,
  force: true,
});
const staticSize = dirSize(join(STANDALONE_NEXT, "static"));
log(`Copied .next/static → standalone/.next/static (${fmt(staticSize)})`);

// ---------- 4. Copy public/ → standalone/public/ ----------
header("Copying public assets (images, icons)");
if (existsSync(PUBLIC_DIR)) {
  cpSync(PUBLIC_DIR, STANDALONE_PUBLIC, {
    recursive: true,
    force: true,
  });
  const publicSize = dirSize(STANDALONE_PUBLIC);
  log(`Copied public/ → standalone/public/ (${fmt(publicSize)})`);
} else {
  warn("No public/ directory found — skipping (may be intentional)");
}

// ---------- 5. Verify critical files ----------
header("Verifying critical assets");

const checks = [
  {
    label: "CSS files",
    // Next.js 16 Turbopack puts CSS in chunks/ instead of css/
    // Check both locations
    dir: join(STANDALONE_NEXT, "static", "chunks"),
    test: (d) =>
      existsSync(d) &&
      readdirSync(d).some((f) => f.endsWith(".css")) ||
      (existsSync(join(STANDALONE_NEXT, "static", "css")) &&
        readdirSync(join(STANDALONE_NEXT, "static", "css")).some((f) => f.endsWith(".css"))),
  },
  {
    label: "Font files",
    dir: join(STANDALONE_NEXT, "static", "media"),
    test: (d) =>
      existsSync(d) &&
      readdirSync(d).some((f) => f.endsWith(".woff2") || f.endsWith(".woff")),
  },
  {
    label: "JS chunks",
    dir: join(STANDALONE_NEXT, "static", "chunks"),
    test: (d) => existsSync(d) && readdirSync(d).length > 0,
  },
  {
    label: "Public images",
    dir: join(STANDALONE_PUBLIC, "images"),
    test: (d) => existsSync(d) && readdirSync(d).length > 0,
  },
];

let allOk = true;
for (const c of checks) {
  if (c.test(c.dir)) {
    // For CSS, count only .css files (chunks dir also has .js)
    if (c.label === "CSS files") {
      const chunksDir = join(STANDALONE_NEXT, "static", "chunks");
      const cssDir = join(STANDALONE_NEXT, "static", "css");
      let cssCount = 0;
      if (existsSync(chunksDir)) {
        cssCount += readdirSync(chunksDir).filter((f) => f.endsWith(".css")).length;
      }
      if (existsSync(cssDir)) {
        cssCount += readdirSync(cssDir).filter((f) => f.endsWith(".css")).length;
      }
      log(`${c.label}: ${cssCount} file(s)`);
    } else {
      const count = readdirSync(c.dir).length;
      log(`${c.label}: ${count} file(s)`);
    }
  } else {
    err(`${c.label}: MISSING or empty at ${c.dir}`);
    allOk = false;
  }
}

// ---------- 6. Summary ----------
header("Build summary");
console.log(`  Standalone dir:  ${STANDALONE_DIR}`);
console.log(`  Static size:     ${fmt(dirSize(join(STANDALONE_NEXT, "static")))}`);
console.log(
  `  Public size:     ${fmt(dirSize(STANDALONE_PUBLIC))}`
);
console.log("");
if (allOk) {
  log("All assets verified. Ready to deploy!");
  console.log("");
  console.log("  Deploy command:");
  console.log("    NODE_ENV=production node .next/standalone/server.js");
  console.log("");
  console.log("  Make sure to copy the ENTIRE .next/standalone/ folder");
  console.log("  to your server, not just server.js.");
} else {
  err("Some assets are missing! Review the errors above before deploying.");
  process.exit(1);
}
