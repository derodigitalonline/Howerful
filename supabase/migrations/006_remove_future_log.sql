-- Migration: Remove Future Log bucket
-- Description: Migrates all future-log items to someday bucket
-- Note: Keeps scheduled_date column for potential future use

-- Migrate existing future-log items to 'someday'
UPDATE bullet_items
SET bucket = 'someday'
WHERE bucket = 'future-log';

-- Note: We're keeping the scheduled_date column and index for potential future use
-- No schema changes needed - only data migration
