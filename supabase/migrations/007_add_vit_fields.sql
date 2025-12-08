-- Migration: Add VIT (Very Important Task) fields
-- Description: Adds columns to support VIT feature with coin bounties
-- Date: 2025-12-05

-- Add VIT (Very Important Task) fields to bullet_items table
ALTER TABLE bullet_items
  ADD COLUMN IF NOT EXISTS is_vit BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vit_bounty INTEGER,
  ADD COLUMN IF NOT EXISTS vit_marked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vit_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vit_cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS original_bucket TEXT;

-- Add check constraint for vit_bounty range (10-100 coins)
ALTER TABLE bullet_items
  ADD CONSTRAINT vit_bounty_range CHECK (vit_bounty IS NULL OR (vit_bounty >= 10 AND vit_bounty <= 100));

-- Add index for finding active VIT (performance optimization)
CREATE INDEX IF NOT EXISTS idx_bullet_items_active_vit
  ON bullet_items(user_id, is_vit, created_at DESC)
  WHERE is_vit = TRUE AND completed = FALSE AND archived_at IS NULL;

-- Add column comments for documentation
COMMENT ON COLUMN bullet_items.is_vit IS 'Marks task as Very Important Task (VIT) - only one per user per day';
COMMENT ON COLUMN bullet_items.vit_bounty IS 'Custom coin bounty for completing VIT (10-100 coins)';
COMMENT ON COLUMN bullet_items.vit_marked_at IS 'Timestamp when task was marked as VIT';
COMMENT ON COLUMN bullet_items.vit_completed_at IS 'Timestamp when VIT was completed';
COMMENT ON COLUMN bullet_items.vit_cancelled_at IS 'Timestamp when VIT status was cancelled';
COMMENT ON COLUMN bullet_items.original_bucket IS 'Original bucket before task was marked as VIT';
