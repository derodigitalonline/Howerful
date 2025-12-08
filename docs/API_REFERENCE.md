# API Reference

Complete reference for Howerful's REST API endpoints, custom hooks, database schema, and TypeScript interfaces.

---

## REST API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Log in existing user
- `POST /api/auth/logout` - Log out current user

### Profile
- `GET /api/profile` - Get user profile (XP, level, coins, cosmetics)
- `PUT /api/profile` - Update profile fields
- `POST /api/profile/complete-onboarding` - Mark onboarding as complete

### Bullet Journal (Dojo)
- `GET /api/bullet-journal` - Get all bullet items
- `POST /api/bullet-journal/items` - Create new bullet item
- `PUT /api/bullet-journal/items/:id` - Update bullet item
- `DELETE /api/bullet-journal/items/:id` - Delete bullet item
- `PUT /api/bullet-journal/reorder` - Reorder items within bucket

### Focus System
- `POST /api/focus/session` - Start new focus session
- `PUT /api/focus/session/:id` - Update session (pause, resume, complete)
- `GET /api/focus/settings` - Get user's focus settings
- `PUT /api/focus/settings` - Update focus settings

### Quests
- `GET /api/quests` - Get all active quests
- `POST /api/quests/:id/claim` - Claim quest reward

### Routines
- `GET /api/routines` - Get all user routines
- `POST /api/routines` - Create new routine
- `PUT /api/routines/:id` - Update routine
- `DELETE /api/routines/:id` - Delete routine

### Cosmetics
- `GET /api/cosmetics` - Get available cosmetics
- `POST /api/cosmetics/purchase` - Purchase cosmetic with coins
- `POST /api/cosmetics/equip` - Equip cosmetic item

---

## Custom Hooks

### useBulletJournal()
**File:** `client/src/hooks/useBulletJournal.tsx`

**Purpose:** Manages bullet journal items across temporal buckets (today, tomorrow, someday, future-log)

**Returns:**
```typescript
{
  items: BulletItem[];                           // All bullet items
  getItemsByBucket: (bucket: Bucket) => BulletItem[];
  addItem: (text, type, bucket, time?, date?, scheduledDate?) => void;
  deleteItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BulletItem>) => void;
  toggleItemCompletion: (id: string, onComplete?, onUncomplete?) => void;
  cycleItemType: (id: string) => void;           // Cycle between task/event
  changeItemType: (id: string, newType: BulletItemType) => void;
  reorderItems: (bucket: Bucket, oldIndex: number, newIndex: number) => void;
  moveItemToBucket: (id: string, newBucket: Bucket) => void;
  archiveItem: (id: string) => void;            // Soft delete with 30-day retention
}
```

### useFocus()
**File:** `client/src/hooks/useFocus.tsx`

**Purpose:** Pomodoro timer state and focus session management

**Returns:**
```typescript
{
  // State
  activeItemId: string | null;
  activeItemText: string | null;
  timeRemaining: number;                         // Seconds left in current session
  isRunning: boolean;
  isPaused: boolean;
  sessionType: 'work' | 'short_break' | 'long_break';
  workSessionsCount: number;

  // Computed Values
  progress: number;                              // 0-100 percentage
  formattedTime: string;                         // "HH:MM:SS" format

  // Settings
  settings: FocusSettings;

  // Actions
  startTimer: (itemId?, itemText?, duration?) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipSession: () => void;
  finishSession: () => void;
  updateSettings: (newSettings: Partial<FocusSettings>) => void;
}
```

### useProfile()
**File:** `client/src/hooks/useProfile.tsx`

**Purpose:** User profile data, XP, coins, cosmetics, and level progression

**Returns:**
```typescript
{
  profile: UserProfile;                          // Current profile state

  // Profile Actions
  updateNickname: (nickname: string) => void;
  completeOnboarding: () => void;

  // XP & Leveling
  addXP: (amount: number) => void;
  level: number;                                 // Computed from totalXP
  levelProgress: number;                         // 0-1 progress to next level
  xpToNextLevel: number;

  // Currency
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;      // Returns false if insufficient

  // Cosmetics
  equipCosmetic: (category: CosmeticCategory, itemId: string) => void;
  unequipCosmetic: (category: CosmeticCategory) => void;
  unlockCosmetic: (cosmeticId: string) => void;
  isUnlocked: (cosmeticId: string) => boolean;

  // Quest Tracking
  trackBulletTaskCompletion: () => void;
  trackFocusSessionCompletion: () => void;
}
```

### useQuests()
**File:** `client/src/hooks/useQuests.tsx`

**Purpose:** Daily quest management, progress tracking, and reward claiming

**Returns:**
```typescript
{
  dailyQuests: DailyQuest[];                     // Active daily quests
  inbox: InboxItem[];                            // Unclaimed rewards

  // Quest Actions
  incrementQuestProgress: (questId: string, amount?: number) => void;
  completeQuest: (questId: string) => void;
  claimQuest: (questId: string) => void;        // Claim rewards
  claimInboxItem: (inboxId: string) => void;

  // Management
  resetDailyQuests: () => void;
  checkAndResetQuests: () => void;              // Check if 24h passed
}
```

### useRoutines()
**File:** `client/src/hooks/useRoutines.tsx`

**Purpose:** Routine CRUD, check-ins, and streak calculation

**Returns:**
```typescript
{
  routines: Routine[];                           // All user routines

  // CRUD Operations
  addRoutine: (title: string, days: number[], time?: string) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;

  // Check-in Actions
  checkInRoutine: (id: string) => void;
  getTodayRoutines: () => Routine[];            // Routines scheduled for today

  // Streak Calculation
  getStreak: (routineId: string) => number;
}
```

### useAuth()
**File:** `client/src/contexts/AuthContext.tsx`

**Purpose:** Authentication state management (Supabase + guest mode)

**Returns:**
```typescript
{
  // State
  user: User | null;                             // Supabase user object
  session: Session | null;                       // Supabase session
  isAuthenticated: boolean;                      // True if logged in
  isLoading: boolean;                            // Loading auth state

  // Actions
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

---

## Database Schema

### Tables Overview

**User Data:**
- `profiles` - User profile, XP, level, coins
- `equipped_cosmetics` - Currently equipped cosmetic items
- `unlocked_cosmetics` - Unlocked cosmetic IDs

**Tasks & Journal:**
- `bullet_items` - Bullet journal items (Today/Tomorrow/Someday/Future-log)

**Focus System:**
- `focus_settings` - User timer preferences
- `focus_sessions` - Historical focus sessions

**Routines:**
- `routines` - Daily habit routines
- `routine_metadata` - Reset tracking for routines

**Quests:**
- `daily_quests` - Active daily quests
- `quest_inbox` - Unclaimed quest rewards
- `claimed_quests` - Quest completion history

---

### Table Schemas

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT 'User',         -- User's actual name
  howie_name TEXT NOT NULL DEFAULT 'Howie',       -- Companion nickname
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 0,
  bullet_tasks_completed INTEGER NOT NULL DEFAULT 0,
  focus_sessions_completed INTEGER NOT NULL DEFAULT 0,
  has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
  selected_sprite TEXT,
  last_daily_quest_reset TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- Primary key on `id`

**RLS Policies:**
- Users can view/update/insert their own profile only

---

#### equipped_cosmetics
```sql
CREATE TABLE equipped_cosmetics (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  hat TEXT,
  shirt TEXT,
  pants TEXT,
  cape TEXT,
  facewear TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### unlocked_cosmetics
```sql
CREATE TABLE unlocked_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cosmetic_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);
```

**Indexes:**
- `idx_unlocked_cosmetics_user_id` on `user_id`

---

#### bullet_items
```sql
CREATE TABLE bullet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL,                             -- 'task' | 'event'
  bucket TEXT NOT NULL DEFAULT 'today',           -- 'today' | 'tomorrow' | 'someday'
  date TEXT,                                      -- Optional date for events
  time TEXT,                                      -- HH:MM format for events
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_index INTEGER NOT NULL DEFAULT 0,
  moved_to_someday_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,                        -- Soft delete (30-day retention)

  -- Focus Mode tracking
  focus_state TEXT DEFAULT 'idle',                -- 'idle' | 'queued' | 'active' | 'completed'
  focus_started_at TIMESTAMPTZ,
  focus_completed_at TIMESTAMPTZ,
  pomodoros_completed INTEGER DEFAULT 0,
  estimated_pomodoros INTEGER
);
```

**Indexes:**
- `idx_bullet_items_user_id` on `user_id`
- `idx_bullet_items_bucket` on `bucket`

---

#### focus_settings
```sql
CREATE TABLE focus_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_duration INTEGER NOT NULL DEFAULT 1500,        -- 25 minutes
  short_break_duration INTEGER NOT NULL DEFAULT 300,  -- 5 minutes
  long_break_duration INTEGER NOT NULL DEFAULT 900,   -- 15 minutes
  long_break_interval INTEGER NOT NULL DEFAULT 4,     -- Every 4 work sessions
  auto_start_breaks BOOLEAN NOT NULL DEFAULT FALSE,
  auto_start_work BOOLEAN NOT NULL DEFAULT FALSE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

#### focus_sessions
```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES bullet_items(id) ON DELETE SET NULL,
  item_text TEXT,                                     -- Snapshot of item text
  phase TEXT NOT NULL,                                -- 'work' | 'short_break' | 'long_break'
  target_duration INTEGER NOT NULL,                   -- Seconds
  actual_duration INTEGER,                            -- Actual duration if finished early
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  was_interrupted BOOLEAN DEFAULT FALSE,
  was_completed BOOLEAN DEFAULT FALSE
);
```

**Indexes:**
- `idx_focus_sessions_user_id` on `user_id`

---

#### routines
```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  days_of_week JSONB NOT NULL,                        -- [0,1,2,3,4,5,6]
  time TEXT,                                          -- HH:MM format
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### routine_metadata
```sql
CREATE TABLE routine_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  last_reset_date TEXT NOT NULL,                      -- YYYY-MM-DD
  last_check_in_date TEXT,                            -- YYYY-MM-DD
  UNIQUE(routine_id)
);
```

---

#### daily_quests
```sql
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,                             -- Quest template ID
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  type TEXT NOT NULL,                                 -- Quest type
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### quest_inbox
```sql
CREATE TABLE quest_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  coin_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### claimed_quests
```sql
CREATE TABLE claimed_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## TypeScript Interfaces

### BulletItem
```typescript
interface BulletItem {
  id: string;
  type: 'task' | 'event';
  text: string;
  bucket: 'today' | 'tomorrow' | 'someday';
  date?: string;                    // Optional date (for events)
  time?: string;                    // HH:MM format (for events)
  completed: boolean;
  createdAt: number;                // Timestamp
  order: number;                    // Manual sort order
  movedToSomedayAt?: number;        // Timestamp when moved to Someday
  archivedAt?: number;              // Timestamp when archived (soft delete)

  // Focus Mode tracking
  focusState?: 'idle' | 'queued' | 'active' | 'completed';
  focusStartedAt?: number;
  focusCompletedAt?: number;
  pomodorosCompleted?: number;
  estimatedPomodoros?: number;
}
```

### UserProfile
```typescript
interface UserProfile {
  totalXP: number;
  level: number;
  coins: number;
  bulletTasksCompleted: number;
  focusSessionsCompleted: number;
  totalQuestsCompleted: number;
  hasCompletedOnboarding: boolean;
  selectedSprite?: string;
  userName: string;                 // User's actual name
  howieName: string;                // Companion nickname
  equippedCosmetics?: EquippedCosmetics;
  unlockedCosmetics: string[];      // Array of cosmetic IDs
  claimedQuests: string[];          // Array of quest IDs
  dailyQuests: DailyQuest[];
  lastDailyQuestReset?: string;     // ISO date string
  inbox: InboxItem[];               // Unclaimed rewards
}
```

### EquippedCosmetics
```typescript
interface EquippedCosmetics {
  hat?: string;
  shirt?: string;
  pants?: string;
  cape?: string;
  facewear?: string;
}
```

### CosmeticItem
```typescript
interface CosmeticItem {
  id: string;
  name: string;
  category: 'hat' | 'shirt' | 'pants' | 'cape' | 'facewear';
  imagePath: string;                // PNG for UI previews
  modelPath?: string;               // .glb file for 3D rendering
  description?: string;
  unlockLevel?: number;
  unlockQuest?: string;
  coinPrice?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  hasAnimation?: boolean;           // True if model has animations
  animationName?: string;           // Animation to play (e.g., 'CapeFlow')
}
```

### DailyQuest
```typescript
interface DailyQuest {
  id: string;
  name: string;
  description: string;
  requirement: number;              // Target count
  progress: number;                 // Current progress
  coinReward: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  type: 'bullet-task-completion' | 'focus-session' | 'routine-based' | 'cosmetic-based';
}
```

### FocusSession
```typescript
interface FocusSession {
  id: string;
  itemId?: string;                  // BulletItem ID (optional)
  itemText?: string;                // Snapshot of text
  phase: 'work' | 'shortBreak' | 'longBreak';
  targetDuration: number;           // Seconds
  actualDuration?: number;          // Actual time if finished early
  startedAt: number;                // Timestamp
  completedAt?: number;             // Timestamp
  wasInterrupted: boolean;
  wasCompleted: boolean;
}
```

### FocusSettings
```typescript
interface FocusSettings {
  workDuration: number;             // Seconds (default: 1500)
  shortBreakDuration: number;       // Seconds (default: 300)
  longBreakDuration: number;        // Seconds (default: 900)
  longBreakInterval: number;        // After N work sessions (default: 4)
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}
```

---

## Leveling & Rewards

### XP System
```typescript
// Level calculation
level = Math.floor(totalXP / 100) + 1;

// XP to next level
nextLevelXP = level * 100;

// Progress percentage
progress = (totalXP % 100) / 100;
```

### Reward Constants
```typescript
BULLET_TASK_XP_REWARD = 10;   // XP for completing bullet task
BULLET_TASK_COIN_REWARD = 5;  // Coins for completing bullet task
```

---

## Data Relationships

```
profiles (1)
  ├─ equipped_cosmetics (1)
  ├─ unlocked_cosmetics (many)
  ├─ bullet_items (many)
  ├─ focus_settings (1)
  ├─ focus_sessions (many)
  ├─ routines (many)
  ├─ daily_quests (many)
  ├─ quest_inbox (many)
  └─ claimed_quests (many)

bullet_items (many) ──> focus_sessions (many) [optional link]

routines (many) ──> routine_metadata (1)
```

---

## Migration Files

Database schema is version-controlled in `supabase/migrations/`:

1. `001_initial_schema.sql` - Initial 15-table schema
2. `002_remove_matrix_add_tracking.sql` - Removed Matrix, added bullet/focus tracking
3. `003_add_future_log_scheduled_date.sql` - Added `scheduled_date` to bullet_items
4. `004_add_user_name_rename_nickname.sql` - Added `user_name`, renamed `nickname` to `howie_name`

---

For detailed system architecture and data flow patterns, see [ARCHITECTURE.md](ARCHITECTURE.md).
