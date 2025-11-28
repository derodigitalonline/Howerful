# Plan: Remove Matrix Page and Redesign Quest System

## Overview
Remove the Eisenhower Matrix page and associated functionality, then redesign the quest system to focus on Dojo (bullet journal), Focus sessions, and Routines.

---

## Phase 1: Remove Matrix Page and Navigation

### Files to DELETE:
- `client/src/pages/Matrix.tsx`
- `client/src/components/MatrixGrid.tsx`

### Files to MODIFY:

#### `client/src/App.tsx`
- **Line 7**: Remove `import Matrix from "@/pages/Matrix";`
- **Line 41**: Remove `<Route path="/matrix" component={Matrix} />`

#### `client/src/components/NavigationDrawer.tsx`
- **Lines 49-54**: Remove the Matrix nav item from the `navItems` array:
  ```typescript
  {
    label: 'Matrix',
    path: '/matrix',
    icon: CheckSquare,
    description: 'Manage your tasks',
  },
  ```

---

## Phase 2: Update Schema - Remove Quadrant System

### `shared/schema.ts`

#### Remove quadrant-related types (Lines 3-16):
- Remove `quadrants` array
- Remove `Quadrant` type
- Remove `XP_REWARDS` constant
- Remove `COIN_REWARDS` constant

#### Remove Task schema (Lines 18-29):
- Delete entire `taskSchema` definition
- Delete `Task` and `InsertTask` types
- Tasks are now handled by the Bullet Journal system only

#### Update UserProfile schema (Lines 103-125):
- **Line 107**: Remove `tasksCompleted` field (will use bullet tasks instead)
- **Line 108**: Remove `doFirstTasksCompleted` field (Matrix-specific)
- **Add new field**: `bulletTasksCompleted: z.number().default(0)`
- **Add new field**: `focusSessionsCompleted: z.number().default(0)`

#### Update DailyQuest types (Line 84):
- Change type enum from:
  ```typescript
  type: z.enum(['task-completion', 'quadrant-specific', 'routine-based', 'cosmetic-based', 'cleanup-based'])
  ```
- To:
  ```typescript
  type: z.enum(['bullet-task-completion', 'focus-session', 'routine-based', 'cosmetic-based'])
  ```
- Remove `'cleanup-based'` (no "Clean Completed Tasks" button in Dojo)
- Remove `'quadrant-specific'` (Matrix-specific)
- Remove `'task-completion'` (replace with `'bullet-task-completion'`)
- Add `'focus-session'` (new type)

- **Line 85**: Remove `quadrant` field (no longer needed)

---

## Phase 3: Update Daily Quest Definitions

### `client/src/constants/dailyQuests.ts`

#### Update DailyQuestDefinition interface (Lines 7-16):
- Change type enum to match schema:
  ```typescript
  type: 'bullet-task-completion' | 'focus-session' | 'routine-based' | 'cosmetic-based';
  ```
- Remove `quadrant?: Quadrant` field

#### Replace DAILY_QUEST_POOL (Lines 23-104) with NEW quests:

```typescript
export const DAILY_QUEST_POOL: DailyQuestDefinition[] = [
  // ===== BULLET TASK COMPLETION QUESTS =====
  {
    id: 'warm-up',
    name: 'Warm Up',
    description: 'Complete 3 bullet journal tasks',
    requirement: 3,
    coinReward: 15,
    xpReward: 10,
    type: 'bullet-task-completion',
  },
  {
    id: 'power-hour',
    name: 'Power Hour',
    description: 'Complete 10 bullet journal tasks',
    requirement: 10,
    coinReward: 30,
    xpReward: 60,
    type: 'bullet-task-completion',
  },
  {
    id: 'productivity-master',
    name: 'Productivity Master',
    description: 'Complete 5 bullet journal tasks',
    requirement: 5,
    coinReward: 20,
    xpReward: 25,
    type: 'bullet-task-completion',
  },

  // ===== FOCUS SESSION QUESTS =====
  {
    id: 'focus-beginner',
    name: 'Focus Beginner',
    description: 'Complete 1 focus session',
    requirement: 1,
    coinReward: 20,
    xpReward: 15,
    type: 'focus-session',
  },
  {
    id: 'focus-pro',
    name: 'Focus Pro',
    description: 'Complete 3 focus sessions',
    requirement: 3,
    coinReward: 40,
    xpReward: 35,
    type: 'focus-session',
  },

  // ===== ROUTINE QUESTS =====
  {
    id: 'routine-crusher',
    name: 'Routine Crusher',
    description: 'Complete 3 tasks in your Daily Routine',
    requirement: 3,
    coinReward: 25,
    xpReward: 25,
    type: 'routine-based',
  },

  // ===== COSMETIC QUESTS =====
  {
    id: 'texture-ocd',
    name: 'Ah... Just Right',
    description: 'Equip your Howie with a different cosmetic',
    requirement: 1,
    coinReward: 25,
    xpReward: 25,
    type: 'cosmetic-based',
  },
];
```

**Total: 7 quests** (still selects 3 random per day)

---

## Phase 4: Update Story Quests

### `client/src/pages/Quests.tsx`

#### Update quest requirements (Lines 158-198):

**Quest 1: "Get Ur Glasses"** (Lines 159-170)
- **OLD**: `requirement="Reach Level 2"` + `progress={Math.min(currentLevel, 2)}`
- **NEW**: `requirement="Complete 5 bullet tasks"` + `progress={Math.min(profile.bulletTasksCompleted || 0, 5)}`
- **OLD**: `isCompleted={currentLevel >= 2}`
- **NEW**: `isCompleted={(profile.bulletTasksCompleted || 0) >= 5}`

**Quest 2: "Task Master"** (Lines 172-184)
- **OLD**: `requirement="Complete 10 tasks"` + `progress={Math.min(profile.tasksCompleted, 10)}`
- **NEW**: `requirement="Complete 15 bullet tasks"` + `progress={Math.min(profile.bulletTasksCompleted || 0, 15)}`
- **OLD**: `isCompleted={profile.tasksCompleted >= 10}`
- **NEW**: `isCompleted={(profile.bulletTasksCompleted || 0) >= 15}`

**Quest 3: "Focus Master"** (rename from "Performative Productivity") (Lines 186-198)
- **OLD NAME**: `name="Performative Productivity"`
- **NEW NAME**: `name="Focus Master"`
- **OLD**: `requirement="Complete 5 'Do First' tasks"` + `progress={Math.min(profile.doFirstTasksCompleted || 0, 5)}`
- **NEW**: `requirement="Complete 3 focus sessions"` + `progress={Math.min(profile.focusSessionsCompleted || 0, 3)}`
- **OLD**: `isCompleted={(profile.doFirstTasksCompleted || 0) >= 5}`
- **NEW**: `isCompleted={(profile.focusSessionsCompleted || 0) >= 3}`
- **Reward**: Keep Tuxedo cosmetic (shirt-tuxedo)

#### Update quest constant names (Lines 12-14):
```typescript
const QUEST_GET_UR_GLASSES = 'quest-get-ur-glasses';
const QUEST_TASK_MASTER = 'quest-task-master';
const QUEST_FOCUS_MASTER = 'quest-focus-master'; // Changed from QUEST_PERFORMATIVE_PRODUCTIVITY
```

#### Update quest IDs in QUEST_REWARDS (Lines 17-21):
```typescript
const QUEST_REWARDS: Record<string, string> = {
  [QUEST_GET_UR_GLASSES]: 'facewear-howerful-glasses',
  [QUEST_TASK_MASTER]: 'hat-baseball-cap',
  [QUEST_FOCUS_MASTER]: 'shirt-tuxedo', // Changed key
};
```

#### Update quest coin rewards (Lines 24-28):
```typescript
const QUEST_COIN_REWARDS: Record<string, number> = {
  [QUEST_GET_UR_GLASSES]: 25,
  [QUEST_TASK_MASTER]: 50,
  [QUEST_FOCUS_MASTER]: 75, // Changed key
};
```

---

## Phase 5: Update Quest Tracking Logic

### `client/src/hooks/useProfile.tsx`

#### Remove awardXP function entirely (Lines 214-280)
- This function was for Matrix quadrant-based XP
- No longer needed - bullet tasks and focus sessions have their own tracking

#### Add new profile tracking functions:

```typescript
/**
 * Track bullet task completion for quests
 * Called when user completes a bullet journal task
 */
const trackBulletTaskCompletion = (): void => {
  let questsToSync: DailyQuest[] = [];

  setProfile(prev => {
    const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
      if (quest.completed || quest.claimed) return quest;
      if (quest.type !== 'bullet-task-completion') return quest;

      const newProgress = quest.progress + 1;
      const isNowCompleted = newProgress >= quest.requirement;
      const updatedQuest = { ...quest, progress: newProgress, completed: isNowCompleted };
      questsToSync.push(updatedQuest);
      return updatedQuest;
    });

    return {
      ...prev,
      bulletTasksCompleted: (prev.bulletTasksCompleted || 0) + 1,
      dailyQuests: updatedDailyQuests,
    };
  });

  // Sync updated quests to Supabase
  if (isAuthenticated && isSupabaseConfigured() && questsToSync.length > 0) {
    questsToSync.forEach(quest => {
      upsertDailyQuest.mutate(quest);
    });
  }
};

/**
 * Track focus session completion for quests
 * Called when user completes a focus session
 */
const trackFocusSessionCompletion = (): void => {
  let questsToSync: DailyQuest[] = [];

  setProfile(prev => {
    const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
      if (quest.completed || quest.claimed) return quest;
      if (quest.type !== 'focus-session') return quest;

      const newProgress = quest.progress + 1;
      const isNowCompleted = newProgress >= quest.requirement;
      const updatedQuest = { ...quest, progress: newProgress, completed: isNowCompleted };
      questsToSync.push(updatedQuest);
      return updatedQuest;
    });

    return {
      ...prev,
      focusSessionsCompleted: (prev.focusSessionsCompleted || 0) + 1,
      dailyQuests: updatedDailyQuests,
    };
  });

  // Sync updated quests to Supabase
  if (isAuthenticated && isSupabaseConfigured() && questsToSync.length > 0) {
    questsToSync.forEach(quest => {
      upsertDailyQuest.mutate(quest);
    });
  }
};
```

#### Update ProfileContextType interface (Lines 37-54):
- Remove: `awardXP: (quadrant: Quadrant) => XPGainResult;`
- Remove: `deductXP: (quadrant: Quadrant) => void;`
- Add: `trackBulletTaskCompletion: () => void;`
- Add: `trackFocusSessionCompletion: () => void;`

#### Update context provider value (Lines 571-590):
- Remove `awardXP` and `deductXP`
- Add `trackBulletTaskCompletion` and `trackFocusSessionCompletion`

---

## Phase 6: Hook Up Tracking to Bullet Journal

### `client/src/pages/Dojo.tsx`

#### Import tracking function (Line 9):
```typescript
const { trackBulletTaskCompletion } = useProfile();
```

#### Update handleToggleItemCompletion (Lines 40-70):
- **Line 43**: Change from `awardXP('schedule')` to `trackBulletTaskCompletion()`
- **Remove**: All XP/coin reward logic (lines 44-59)
- **Simplify**: Just call `trackBulletTaskCompletion()` and show simple toast

**NEW implementation**:
```typescript
const handleToggleItemCompletion = (id: string) => {
  toggleItemCompletion(
    id,
    () => {
      // Track completion for quests
      trackBulletTaskCompletion();
      toast.success('Task completed!', {
        duration: 2000,
      });
    },
    () => {
      // No deduction needed - quests track total completions
      toast.info('Task uncompleted', {
        duration: 2000,
      });
    }
  );
};
```

---

## Phase 7: Hook Up Tracking to Focus Sessions

### `client/src/hooks/useFocus.tsx`

#### Import tracking function:
```typescript
import { useProfile } from './useProfile';
```

#### Add to FocusProvider:
```typescript
const { trackFocusSessionCompletion } = useProfile();
```

#### Find where focus sessions complete successfully:
- Look for `addFocusSession.mutate()` calls
- After logging the session, call `trackFocusSessionCompletion()`

**Location to modify**: Around line 283 (when timer finishes naturally)
```typescript
// After logging the completed session
addSession.mutate(completedSession);

// Track completion for quests
trackFocusSessionCompletion();
```

**Also modify**: Around line 463 (when timer is interrupted but still counts as completed)
- Only call `trackFocusSessionCompletion()` if it was a work session that completed most of the time

---

## Phase 8: Update Supabase Schema

### Add migration file: `supabase/migrations/00X_remove_matrix_add_tracking.sql`

```sql
-- Remove Matrix-related fields from profiles table
ALTER TABLE profiles
  DROP COLUMN IF EXISTS tasks_completed,
  DROP COLUMN IF EXISTS do_first_tasks_completed;

-- Add new tracking fields
ALTER TABLE profiles
  ADD COLUMN bullet_tasks_completed INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN focus_sessions_completed INTEGER DEFAULT 0 NOT NULL;

-- Remove quadrant-specific data from daily_quests table
ALTER TABLE daily_quests
  DROP COLUMN IF EXISTS quadrant;

-- Note: Existing daily quest data will be cleared on next reset anyway
-- No need to migrate existing quest types
```

---

## Phase 9: Update Supabase Hooks

### `client/src/hooks/useSupabaseProfile.tsx`

#### Update dbRowToProfile function (Lines 7-17):
- Remove: `doFirstTasksCompleted: row.do_first_tasks_completed || 0`
- Remove: `tasksCompleted: row.tasks_completed || 0`
- Add: `bulletTasksCompleted: row.bullet_tasks_completed || 0`
- Add: `focusSessionsCompleted: row.focus_sessions_completed || 0`

#### Update profileToDbRow function (Lines 21-31):
- Remove: `do_first_tasks_completed: profile.doFirstTasksCompleted`
- Remove: `tasks_completed: profile.tasksCompleted`
- Add: `bullet_tasks_completed: profile.bulletTasksCompleted`
- Add: `focus_sessions_completed: profile.focusSessionsCompleted`

---

## Phase 10: Clean Up Matrix-Related Code

### `client/src/hooks/useTasks.tsx`
- **DELETE ENTIRE FILE** - This was for Matrix task management
- No longer needed

### `client/src/hooks/useSupabaseTasks.tsx`
- **KEEP FILE** - Still used for other functionality
- But can remove Matrix-specific code if found

### Remove unused imports:
- Search for and remove any imports of `Quadrant` type
- Remove imports of `XP_REWARDS`, `COIN_REWARDS`
- Remove imports of `awardXP`, `deductXP` functions

---

## Questions for User:

1. **"Clean Completed Tasks" button**: I removed the 'cleanup-based' quest type since there's no cleanup button in Dojo. Is this correct?

2. **Focus session tracking**: Should we count ANY completed focus session, or only work sessions? Currently planning to count work sessions only.

3. **Routine tracking**: The 'routine-based' quest type is kept - does the Routines page still exist and work?

4. **Bulletin task completion**: Should this count when toggling a task as complete, or also when completing via focus session auto-complete?

5. **Migration strategy**: Should we reset all users' daily quests when deploying this, or try to preserve existing progress?

---

## Testing Checklist

After implementation:
- [ ] Matrix page is removed and navigation link is gone
- [ ] Daily quests generate correctly (7 quests, 3 shown)
- [ ] Completing bullet tasks increments quest progress
- [ ] Completing focus sessions increments quest progress
- [ ] Completing routine items increments quest progress
- [ ] Equipping cosmetics increments quest progress
- [ ] Story quests show correct progress
- [ ] Claiming story quests unlocks cosmetics
- [ ] All quest progress persists after page refresh
- [ ] Supabase sync works for all quest types
- [ ] No console errors related to missing Matrix code
