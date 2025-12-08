ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'User';

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


ALTER TABLE profiles
  ALTER COLUMN howie_name SET DEFAULT 'Howie';

COMMENT ON COLUMN profiles.user_name IS 'User''s actual first name (displayed in profile button)';
COMMENT ON COLUMN profiles.howie_name IS 'User''s nickname for their Howie companion';
