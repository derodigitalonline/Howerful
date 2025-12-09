Reference guide for understanding Howerful codebase

## Project Overview

Gamified productivity app combining bullet journaling, focus sessions, habit tracking, and RPG-style progression.

**Core Concept:** Help users manage tasks while building habits and progressing their companion character "Howie" through XP, levels, and cosmetic customization.

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui (styling)
- Three.js + React Three Fiber (3D avatar)
- Wouter (routing)
- React Query (server state)
- dnd-kit (drag & drop)

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Express.js (API layer, optional)

**State Management:**
- React Query for server data
- Context API for global state (Auth, Focus, Profile)
- localStorage for guest users

---

## Core Systems

### 1. Dojo (Bullet Journal)
**Files:** `client/src/pages/Dojo.tsx`, `client/src/hooks/useBulletJournal.tsx`

**Purpose:** ADHD-friendly task management using temporal buckets instead of specific dates

**Buckets:**
- **Today** - current focus
- **Tomorrow** - next day planning
- **Someday** - backlog/ideas

**Key Features:**
- All items are tasks (with optional time/date)
- Archive completed tasks (30-day soft delete)

**Rewards:** 10 XP + 5 coins per completed task

---

### 2. Focus Mode (Pomodoro)
**Files:** `client/src/pages/Focus.tsx`, `client/src/pages/FocusStart.tsx`, `client/src/hooks/useFocus.tsx`

**Purpose:** Pomodoro timer with task tracking and session history

**Features:**
- Right-click context menu on tasks → fullscreen start page
- Custom duration selection (5/10/25 min presets + custom 1-180 min)
- Configurable durations (default: 25min work, 5min short break, 15min long break)
- Session cycle: Work → Short Break → Work → Long Break (every 4 sessions)
- Active item tracking (linked to bullet items)
- Switch focus dialog
- Session persistence via localStorage
- History tracking in Supabase

**State persisted:**
- Active item ID and text
- Time remaining
- Session type and count
- Running/paused state

---

### 3. Quest System
**Files:** `client/src/pages/Quests.tsx`, `client/src/hooks/useQuests.tsx`

**Purpose:** Daily challenges for engagement and rewards

**Quest Types:**
- `bullet-task-completion` - Complete N bullet tasks
- `focus-session` - Complete N focus sessions
- `routine-based` - Check in to routines
- `cosmetic-based` - Unlock cosmetics

**Flow:**
1. Quests auto-generate daily at midnight
2. User completes requirements → quest marked complete
3. User claims rewards → XP/coins added, quest moves to inbox
4. Unclaimed quests expire after 24h → move to inbox

**Tracking:** Progress tracked in `useProfile` via `trackBulletTaskCompletion()`, `trackCosmeticChange()`, and `trackFocusSessionCompletion()`

---

### 4. Profile & Cosmetics
**Files:** `client/src/pages/Profile.tsx`, `client/src/hooks/useProfile.tsx`, `client/src/constants/cosmetics.ts`

**Purpose:** User progression and 3D avatar customization

**Progression:**
- Level formula: `level = floor(totalXP / 100) + 1`
- XP to next level: `level * 100`
- Progress: `(totalXP % 100) / 100`

**Cosmetics:**
- Categories: hat, shirt, pants, cape, facewear
- 3D models (.glb files) attached to Howie's armature bones
- PNG previews for UI grids (Bazaar, Customize pages)
- Unlocked via: quests, level requirements, or coin purchase

**3D System:**
- Base model: `public/models/Howie.glb` with attachment bones
- Cosmetics: `public/models/cosmetics/*.glb`
- Rendered with Three.js in `components/HowieViewer3D.tsx`
- Bone-based attachment (static items + rigged capes with animations)

---

### 5. Routines
**Files:** `client/src/pages/Routines.tsx`, `client/src/hooks/useRoutines.tsx`

**Purpose:** Daily habit tracking with streaks

**Features:**
- Schedule by days of week (0-6 = Sun-Sat)
- Optional time for reminders
- Streak calculation
- Reset tracking

**Database:** `routines` table + `routine_metadata` for reset state

---

## Key Hooks

| Hook | Purpose | Key Returns |
|------|---------|-------------|
| `useBulletJournal()` | Bullet item CRUD + bucket management | `items`, `addItem()`, `toggleItemCompletion()`, `moveItemToBucket()`, `archiveItem()` |
| `useFocus()` | Pomodoro timer state + controls | `timeRemaining`, `isRunning`, `startTimer()`, `pauseTimer()`, `skipSession()`, `settings` |
| `useProfile()` | User data, XP, coins, cosmetics | `profile`, `addXP()`, `addCoins()`, `equipCosmetic()`, `level`, `levelProgress` |
| `useQuests()` | Quest management + claiming | `dailyQuests`, `inbox`, `claimQuest()`, `resetDailyQuests()` |
| `useRoutines()` | Routine CRUD + check-ins | `routines`, `checkInRoutine()`, `getStreak()`, `getTodayRoutines()` |
| `useAuth()` | Authentication (Supabase + guest) | `user`, `isAuthenticated`, `signIn()`, `signOut()` |

---

## Database Tables (12 total)

### Core User Data
- `profiles` - User profile, XP, level, coins, tracking counters
- `equipped_cosmetics` - Currently worn items (1:1 with profiles)
- `unlocked_cosmetics` - Cosmetic IDs unlocked (many:1 with profiles)

### Bullet Journal
- `bullet_items` - Tasks/events with buckets, focus tracking, soft delete

### Focus System
- `focus_settings` - User timer preferences (1:1 with profiles)
- `focus_sessions` - Completed session history

### Routines
- `routines` - User habits with days/time
- `routine_metadata` - Reset state tracking (1:1 with routines)

### Quests
- `daily_quests` - Active daily quests
- `quest_inbox` - Unclaimed rewards
- `claimed_quests` - Quest completion history

**RLS:** All tables have Row Level Security enforcing `auth.uid() = user_id`

Full schema: [API_REFERENCE.md](API_REFERENCE.md)

---

## Important Patterns

### State Management
- **Server state:** React Query for all Supabase data
- **Global state:** Context API for Auth, Focus, Profile
- **Local-only:** localStorage for guest users, focus timer state
- **Optimistic updates:** useMutation with immediate UI updates

### Auth Strategy
- **Dual-mode:** Authenticated (Supabase) + Guest (localStorage)
- Guest data persists until sign-up or clear
- Guest → Authenticated migration available
- Warn before close/refresh in guest mode (prevent data loss)

### Component Organization
```
client/src/
├── components/        # Reusable UI (BulletCard, FocusTimer, etc.)
├── pages/            # Route components (Dojo, Focus, Profile, etc.)
├── hooks/            # Business logic hooks (useBulletJournal, etc.)
├── contexts/         # React Context providers (AuthContext)
├── constants/        # Static data (cosmetics library)
└── lib/              # Utilities (supabase client, utils)
```

### Data Flow
```
User Action
  ↓
Component calls hook method
  ↓
Hook triggers React Query mutation
  ↓
Supabase updates database
  ↓
React Query invalidates & refetches
  ↓
Component re-renders with new data
```

---

## Common Gotchas

1. **No auto-migration between buckets** - Items stay in bucket until manually moved

2. **Guest mode data loss** - Closing browser clears localStorage

3. **Cosmetics dual format** - PNG for UI previews, .glb for 3D rendering

4. **Focus session conflicts** - Only one active session at a time, `SwitchFocusDialog` confirms changes

5. **Quest claiming** - Completing quest ≠ claiming rewards. User must manually claim.

6. **Soft deletes** - Archived items have `archivedAt` timestamp, retained 30 days

7. **Time is optional** - All items are tasks; adding time just makes it a scheduled task

---

## File Locations

**Core Logic:**
- Schemas: `shared/schema.ts` (Zod validation)
- Cosmetics: `client/src/constants/cosmetics.ts` (library of all items)
- Supabase client: `client/src/lib/supabase.ts`

**Database:**
- Migrations: `supabase/migrations/*.sql` (version-controlled schema)
- RLS policies: Defined in migration 001

**Assets:**
- 3D models: `client/public/models/` (Howie.glb + cosmetics/)
- Images: `client/public/assets/` (cosmetics PNGs)

---

## Development Commands

```bash
npm run dev          # Start dev server (client + server)
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:push      # Push schema changes
```

---

## Current Sprint

See [PLAN.md](../PLAN.md) for latest priorities.

**Recent Major Features:**
- Right-click focus session start flow
- Archive system with 30-day retention
- 3D cosmetics with bone-based attachment
- Quest inbox for unclaimed rewards

---

## Design Patterns

### Button Variants
- `default` - Primary (blue, 3D glass effect)
- `destructive` - Dangerous (red, 3D glass)
- `outline` - Secondary (border, chunky 3D)
- `secondary` - Tertiary (muted, chunky 3D)
- `ghost` - Minimal (transparent)

### Layout
- Fixed TopBar (64px) with hamburger, coins, profile
- Collapsible NavigationDrawer (256px expanded, 80px collapsed)
- Main content with responsive padding

---

## Environment Variables

Required in `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## For More Details

- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md) - System design, data flow
- **API Reference:** [API_REFERENCE.md](API_REFERENCE.md) - Endpoints, hooks, schemas
- **Setup:** [SETUP.md](SETUP.md) - Installation, Supabase configuration
- **Design:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - UI/UX patterns, colors
- **Changes:** [CHANGELOG.md](CHANGELOG.md) - Development history

---

**Last Updated:** December 2025
