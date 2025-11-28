-- Add Future Log support with scheduled_date field
-- This enables automatic task migration from Future Log to Today

-- ============================================================================
-- UPDATE BULLET_ITEMS TABLE
-- ============================================================================

-- Add scheduled_date column for Future Log items
ALTER TABLE bullet_items
  ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Create index for efficient querying of scheduled items
CREATE INDEX IF NOT EXISTS idx_bullet_items_scheduled_date
  ON bullet_items(user_id, scheduled_date)
  WHERE scheduled_date IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN bullet_items.scheduled_date IS 'Date when Future Log item should auto-migrate to Today bucket (YYYY-MM-DD)';
