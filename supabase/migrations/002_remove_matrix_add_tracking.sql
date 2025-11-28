-- Remove Matrix tracking and add new quest tracking fields
-- Migration to support transition from Eisenhower Matrix to Dojo/Focus system

-- ============================================================================
-- UPDATE PROFILES TABLE
-- ============================================================================

-- Remove Matrix-related tracking fields
ALTER TABLE profiles
  DROP COLUMN IF EXISTS tasks_completed,
  DROP COLUMN IF EXISTS do_first_tasks_completed;

-- Add new tracking fields for Bullet Journal and Focus sessions
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bullet_tasks_completed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS focus_sessions_completed INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN profiles.bullet_tasks_completed IS 'Count of completed bullet journal tasks';
COMMENT ON COLUMN profiles.focus_sessions_completed IS 'Count of completed focus/pomodoro sessions';
