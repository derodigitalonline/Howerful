-- Migration: Add user_name and rename nickname to howie_name
-- This separates the user's actual name from their Howie companion's name

-- ============================================================================
-- UPDATE PROFILES TABLE
-- ============================================================================

-- Add user_name column for the user's actual first name
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'User';

-- Rename nickname column to howie_name for clarity
-- This represents the user's nickname for their Howie companion
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'nickname'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN nickname TO howie_name;
  END IF;
END $$;

-- Set default value for howie_name if it was just renamed
ALTER TABLE profiles
  ALTER COLUMN howie_name SET DEFAULT 'Howie';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN profiles.user_name IS 'User''s actual first name (displayed in profile button)';
COMMENT ON COLUMN profiles.howie_name IS 'User''s nickname for their Howie companion';
