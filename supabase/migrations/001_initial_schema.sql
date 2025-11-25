-- Howerful Database Schema
-- This creates all tables needed for user data persistence

-- ============================================================================
-- USER PROFILES
-- ============================================================================

-- Main user profile (1:1 with auth.users)
-- Stores XP, level, coins, and onboarding state
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT 'Howie',
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  do_first_tasks_completed INTEGER NOT NULL DEFAULT 0,
  has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
  selected_sprite TEXT,
  last_daily_quest_reset TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, has_completed_onboarding)
  VALUES (NEW.id, 'Howie', FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- COSMETICS SYSTEM
-- ============================================================================

-- Equipped cosmetics (1:1 with profiles)
CREATE TABLE IF NOT EXISTS equipped_cosmetics (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  hat TEXT,
  shirt TEXT,
  pants TEXT,
  cape TEXT,
  pet TEXT,
  facewear TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE equipped_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own equipped cosmetics"
  ON equipped_cosmetics
  USING (auth.uid() = user_id);

-- Unlocked cosmetics (many-to-many)
CREATE TABLE IF NOT EXISTS unlocked_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cosmetic_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

ALTER TABLE unlocked_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own unlocked cosmetics"
  ON unlocked_cosmetics
  USING (auth.uid() = user_id);

CREATE INDEX idx_unlocked_cosmetics_user_id ON unlocked_cosmetics(user_id);

-- ============================================================================
-- MATRIX TASKS (Eisenhower Matrix)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  quadrant TEXT, -- "do-first" | "schedule" | "delegate" | "eliminate"
  workspace TEXT NOT NULL DEFAULT 'personal', -- "personal" | "work"
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_in_quadrant TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON tasks
  USING (auth.uid() = user_id);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_workspace ON tasks(user_id, workspace);
CREATE INDEX idx_tasks_user_quadrant ON tasks(user_id, quadrant);

-- ============================================================================
-- BULLET JOURNAL ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bullet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "task" | "event" | "note"
  text TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'today', -- "today" | "tomorrow" | "someday"
  date TEXT,
  time TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  moved_to_someday_at TIMESTAMPTZ,

  -- Focus Mode integration
  focus_state TEXT DEFAULT 'idle', -- "idle" | "queued" | "active" | "completed"
  focus_started_at TIMESTAMPTZ,
  focus_completed_at TIMESTAMPTZ,
  pomodoros_completed INTEGER NOT NULL DEFAULT 0,
  estimated_pomodoros INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bullet_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bullet items"
  ON bullet_items
  USING (auth.uid() = user_id);

CREATE INDEX idx_bullet_items_user_id ON bullet_items(user_id);
CREATE INDEX idx_bullet_items_user_bucket ON bullet_items(user_id, bucket);
CREATE INDEX idx_bullet_items_order ON bullet_items(user_id, bucket, order_index DESC);

-- ============================================================================
-- FOCUS SYSTEM
-- ============================================================================

-- Focus settings (1:1 with profiles)
CREATE TABLE IF NOT EXISTS focus_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  work_duration INTEGER NOT NULL DEFAULT 1500,
  short_break_duration INTEGER NOT NULL DEFAULT 300,
  long_break_duration INTEGER NOT NULL DEFAULT 900,
  long_break_interval INTEGER NOT NULL DEFAULT 4,
  auto_start_breaks BOOLEAN NOT NULL DEFAULT FALSE,
  auto_start_work BOOLEAN NOT NULL DEFAULT FALSE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE focus_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own focus settings"
  ON focus_settings
  USING (auth.uid() = user_id);

-- Focus sessions (historical log)
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID, -- Can reference tasks or bullet_items (not enforced FK)
  item_text TEXT,
  phase TEXT NOT NULL, -- "work" | "shortBreak" | "longBreak"
  target_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  was_interrupted BOOLEAN NOT NULL DEFAULT FALSE,
  was_completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
  ON focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_started_at ON focus_sessions(user_id, started_at DESC);

-- ============================================================================
-- DAILY ROUTINES
-- ============================================================================

CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own routines"
  ON routines
  USING (auth.uid() = user_id);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_order ON routines(user_id, order_index);

-- Routine metadata (daily reset tracking)
CREATE TABLE IF NOT EXISTS routine_metadata (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_claimed_date DATE,
  last_reset_date DATE NOT NULL,
  xp_awarded_routine_ids UUID[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE routine_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own routine metadata"
  ON routine_metadata
  USING (auth.uid() = user_id);

-- ============================================================================
-- QUEST SYSTEM
-- ============================================================================

-- Daily quests (active quests per user)
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL, -- References quest template ID from frontend
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own daily quests"
  ON daily_quests
  USING (auth.uid() = user_id);

CREATE INDEX idx_daily_quests_user_id ON daily_quests(user_id);

-- Quest inbox (unclaimed rewards)
CREATE TABLE IF NOT EXISTS quest_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  coin_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quest_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quest inbox"
  ON quest_inbox
  USING (auth.uid() = user_id);

CREATE INDEX idx_quest_inbox_user_id ON quest_inbox(user_id);
CREATE INDEX idx_quest_inbox_created_at ON quest_inbox(user_id, created_at DESC);

-- Claimed quests (permanent record)
CREATE TABLE IF NOT EXISTS claimed_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

ALTER TABLE claimed_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own claimed quests"
  ON claimed_quests
  USING (auth.uid() = user_id);

CREATE INDEX idx_claimed_quests_user_id ON claimed_quests(user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that need it
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipped_cosmetics_updated_at BEFORE UPDATE ON equipped_cosmetics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bullet_items_updated_at BEFORE UPDATE ON bullet_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_settings_updated_at BEFORE UPDATE ON focus_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_metadata_updated_at BEFORE UPDATE ON routine_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'Main user profile with XP, level, coins, and progress tracking';
COMMENT ON TABLE equipped_cosmetics IS 'Currently equipped cosmetic items per user';
COMMENT ON TABLE unlocked_cosmetics IS 'Cosmetic items unlocked through quests, purchases, or level rewards';
COMMENT ON TABLE tasks IS 'Eisenhower Matrix tasks organized by quadrant and workspace';
COMMENT ON TABLE bullet_items IS 'Bullet journal items (tasks, events, notes) organized by temporal buckets';
COMMENT ON TABLE focus_settings IS 'User preferences for Pomodoro timer (durations, auto-start, notifications)';
COMMENT ON TABLE focus_sessions IS 'Historical log of completed focus sessions';
COMMENT ON TABLE routines IS 'Daily habit routines for tracking completion';
COMMENT ON TABLE routine_metadata IS 'Metadata for daily routine reset and XP tracking';
COMMENT ON TABLE daily_quests IS 'Active daily quests with progress tracking';
COMMENT ON TABLE quest_inbox IS 'Unclaimed quest rewards from expired quests';
COMMENT ON TABLE claimed_quests IS 'Permanent record of quests the user has claimed';
