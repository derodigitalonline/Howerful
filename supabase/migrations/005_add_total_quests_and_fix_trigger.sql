-- Add missing total_quests_completed column and fix handle_new_user trigger
-- This ensures profile rows are created correctly with all required fields

-- ============================================================================
-- UPDATE PROFILES TABLE
-- ============================================================================

-- Add total_quests_completed column (was missing from previous migrations)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_quests_completed INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN profiles.total_quests_completed IS 'Total count of all quests claimed by user';

-- ============================================================================
-- FIX PROFILE CREATION TRIGGER
-- ============================================================================

-- Update the handle_new_user trigger to use correct column names
-- Previous trigger used 'nickname' which was renamed to 'howie_name'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_name,
    howie_name,
    has_completed_onboarding,
    total_xp,
    level,
    coins,
    bullet_tasks_completed,
    focus_sessions_completed,
    total_quests_completed
  )
  VALUES (
    NEW.id,
    'User',  -- Default user name
    'Howie', -- Default Howie companion name
    FALSE,   -- User hasn't completed onboarding yet
    0,       -- Starting XP
    1,       -- Starting level
    0,       -- Starting coins
    0,       -- No tasks completed yet
    0,       -- No focus sessions completed yet
    0        -- No quests completed yet
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Trigger already exists from migration 001, no need to recreate it
-- The CREATE OR REPLACE FUNCTION above will update the existing function
