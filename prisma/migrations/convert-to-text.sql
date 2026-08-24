-- ============================================================
-- নেকির ঝুড়ি — MySQL Migration: Convert long-content columns to TEXT
-- ============================================================
--
-- PROBLEM: MySQL defaults VARCHAR(191) for Prisma String fields without
-- explicit length. Long-form content (descriptions, markdown bodies,
-- JSON arrays) gets truncated at 191 characters.
--
-- SOLUTION: ALTER TABLE to change these columns to TEXT.
--
-- This script is SAFE to run on production:
-- - Does NOT delete any data
-- - Does NOT drop any tables
-- - Does NOT reset the database
-- - TEXT columns can hold up to 65,535 bytes (sufficient for all content)
--
-- Run this ONCE on your production MySQL server after deploying the
-- latest code:
--
--   mysql -u nekirjhuri -p nekirjhuri < prisma/migrations/convert-to-text.sql
--
-- Or copy-paste into phpMyAdmin / MySQL CLI.
-- ============================================================

-- UmmahNeed: summary + description (long-form content)
ALTER TABLE UmmahNeed MODIFY COLUMN summary TEXT;
ALTER TABLE UmmahNeed MODIFY COLUMN description TEXT;

-- Project: description + tags (blog description, comma-separated tags)
ALTER TABLE Project MODIFY COLUMN description TEXT;
ALTER TABLE Project MODIFY COLUMN tags TEXT;

-- ProjectUpdate: description + body (summary + full markdown body)
ALTER TABLE ProjectUpdate MODIFY COLUMN description TEXT;
ALTER TABLE ProjectUpdate MODIFY COLUMN body TEXT;

-- FixedProject: description + gallery (institution description, JSON array)
ALTER TABLE FixedProject MODIFY COLUMN description TEXT;
ALTER TABLE FixedProject MODIFY COLUMN gallery TEXT;

-- RevenueModule: description + howItWorks + socialLinks
ALTER TABLE RevenueModule MODIFY COLUMN description TEXT;
ALTER TABLE RevenueModule MODIFY COLUMN howItWorks TEXT;
ALTER TABLE RevenueModule MODIFY COLUMN socialLinks TEXT;

-- Verify (optional — check column types)
-- SHOW COLUMNS FROM UmmahNeed WHERE Field IN ('summary', 'description');
-- SHOW COLUMNS FROM Project WHERE Field IN ('description', 'tags');
-- SHOW COLUMNS FROM ProjectUpdate WHERE Field IN ('description', 'body');
-- SHOW COLUMNS FROM FixedProject WHERE Field IN ('description', 'gallery');
-- SHOW COLUMNS FROM RevenueModule WHERE Field IN ('description', 'howItWorks', 'socialLinks');
