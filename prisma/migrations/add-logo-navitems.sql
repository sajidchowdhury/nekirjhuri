-- ============================================================
-- নেকির ঝুড়ি — MySQL Migration: Add logo + navItems to SiteSettings
-- ============================================================
--
-- Adds two new columns to the SiteSettings table:
--   logo     VARCHAR/TEXT — path to uploaded logo image
--   navItems TEXT         — JSON array of {label, href} for custom nav
--
-- Safe to run on production:
-- - Does NOT delete any data
-- - Does NOT drop any tables
-- - ALTER TABLE ADD COLUMN is non-destructive
--
-- Run this ONCE on your production MySQL server:
--
--   mysql -u nekirjhuri -p nekirjhuri < prisma/migrations/add-logo-navitems.sql
-- ============================================================

ALTER TABLE SiteSettings ADD COLUMN logo VARCHAR(500) NULL;
ALTER TABLE SiteSettings ADD COLUMN navItems TEXT NULL;
