# Howerful Development Plan

**Last Updated:** 2025-10-24

---

## Project Overview

**Howerful** is a gamified task management web app that combines the Eisenhower Matrix (Urgent/Important quadrants) with RPG-style progression mechanics. Users complete tasks to earn XP and Howie Coins, level up (max level 50), unlock cosmetics, and complete quests.

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **State Management:** React Context API (custom hooks: `useProfile`, `useTasks`)
- **Backend:** Express + planned PostgreSQL/Drizzle ORM (currently localStorage)
- **Key Libraries:** React Query, Framer Motion, @dnd-kit, Wouter, Zod
- **Deployment:** Single-port server (default 5000)

---

## Current State (What's Working)

### Core Features ✅
- **Eisenhower Matrix:** Brain Dump + 4 quadrants (Do First, Schedule, Delegate, Eliminate)
- **Drag & Drop:** Tasks moveable between quadrants via @dnd-kit
- **Workspace Separation:** Personal and Work matrices
- **Task Management:** Create, edit, delete, mark complete/incomplete, bulk cleanup

### Gamification Systems ✅
- **XP & Leveling:** Exponential curve (Runescape-inspired), max level 50
  - Do First: 20 XP / 10 coins
  - Schedule: 10 XP / 5 coins
  - Delegate: 10 XP / 5 coins
  - Eliminate: 5 XP / 2 coins
- **Currency:** Howie Coins earned from tasks and quests
- **Daily Quests:** 3 random quests per day from fixed pool of 8, auto-reset at midnight with inbox system
- **Story Quests:** Permanent quests with exclusive cosmetic rewards
- **Cosmetics System:** 6 categories (Hats, Shirts, Pants, Capes, Pets, Facewear)
- **Avatar Rendering:** Layered sprite system with z-index stacking
- **Bazaar Shop:** Purchase cosmetics with coins

### UI/UX ✅
- **Navigation Drawer:** Fixed sidebar with profile card and page links
- **Top Bar:** Fixed header with coin display and profile picture
- **XP Bar:** Live progress indicator to next level
- **Onboarding Dialog:** Nickname setup for new users
- **Daily Routines Page:** Full implementation with habit tracking, XP rewards, and daily bounty system
- **Animations:** Floating XP notifications, confetti on quest completion, particle bursts
- **Keyboard Shortcuts:** Ctrl+Enter for task creation
- **Developer Tools:** Profile reset, XP injection, level jumping

### Data Persistence ✅
- **Storage:** localStorage for all user data (tasks, profile, quests)
- **Schemas:** Zod validation in `shared/schema.ts`

---

## Recently Completed (Git History)

- ✅ **Daily Quest System Refactor** (2025-10-24) - Replaced template-based generation with fixed rotation model ✅ **TESTED & VERIFIED**
  - Changed from dynamic quest generation to fixed pool of 8 predefined quests
  - Removed `templateId` field from DailyQuest schema, use `id` directly for quest identification
  - Added quest type tracking (task-completion, quadrant-specific, routine-based, cosmetic-based, cleanup-based)
  - Implemented inbox system for unclaimed quest rewards when quests expire
  - Added visual state for claimed quests (opacity-50, line-through on name, "Claimed!" badge)
  - Claimed quests remain visible until midnight (don't disappear immediately)
  - Added tracking functions: `trackRoutineCompletion()`, `trackCosmeticChange()`, `trackCleanupEvent()`
  - Integrated quest tracking across Routines, Customize, and Matrix (cleanup) pages
  - **Testing completed:** Quest progress tracking verified for task-completion and quadrant-specific quest types
  - **Migration note:** Old quests with `templateId` format require localStorage clear + dev server restart for new format
  - **Bug fix:** Updated `resetProfile()` to include new fields (inbox, claimedQuests, unlockedCosmetics)
  - **Files modified:** `shared/schema.ts`, `client/src/constants/dailyQuests.ts`, `client/src/hooks/useProfile.tsx`, `client/src/components/DailyQuest.tsx`, `client/src/hooks/useTasks.tsx`, `client/src/pages/Customize.tsx`, `client/src/pages/Routines.tsx`
- ✅ **Deprecated Example Components Cleanup** (2025-10-24) - Removed unused scaffolding code
  - Deleted entire `client/src/components/examples/` folder
  - Removed: Matrix.tsx, NavigationDrawer.tsx, QuadrantCard.tsx, TaskCard.tsx, TaskInput.tsx
  - These were old prototype components that were replaced by production versions
  - No imports found in codebase (safe to delete)
- ✅ **Routines Page Layout Fix** (2025-10-24) - Fixed duplicate layout structure in Routines.tsx
  - Removed duplicate `NavigationDrawer` component rendering (was duplicating App.tsx's persistent drawer)
  - Removed nested layout wrapper divs (`flex h-screen`, `ml-64`) that were doubling the left margin
  - Changed root wrapper to standard page pattern: `h-full p-6 md:p-8 overflow-y-auto`
  - Removed unused `NavigationDrawer` import
  - **Result:** Routines page now has consistent padding/margin with all other pages
  - **Pattern established:** All pages (Home, Profile, Customize, Quests, Bazaar, Routines) follow same layout structure
- ✅ **Layout Padding Fix** (2025-10-24) - Fixed unequal padding issue across all pages
  - Removed duplicate NavigationDrawer and layout wrapper components from Profile, Customize, Quests, and Bazaar pages
  - All pages now follow Home.tsx pattern - App.tsx handles persistent layout (NavigationDrawer + TopBar)
  - Fixed content being pushed too far right due to duplicate `ml-64` margin
  - TopBar now consistently appears on all pages with coin display
  - Eliminated duplicate component rendering for cleaner, more maintainable code
- ✅ **Cosmetics System Cleanup** (2025-10-23) - Separated cosmetics into three distinct unlock paths:
  - **Quest Rewards:** Baseball Cap, Tuxedo, Howerful Glasses
  - **Level Rewards:** Tabby Cat (Lv8), Blue Cape (Lv15), Red Cape (Lv20), Golden Crown (Lv25)
  - **Bazaar Shop:** Blue Jeans (30 coins), Cozy Hoodie (75 coins), Wizard Hat (150 coins), Golden Retriever (300 coins)
  - Removed dual unlock methods (unlockLevel + coinPrice conflicts)
  - Fixed Bazaar shop filter to enforce mutually exclusive unlock systems
  - Fixed `isCosmeticUnlocked()` to properly validate shop item ownership (prevents equipping unpurchased items)
- ✅ Personal/Work matrix workspace distinction (e5d23c5) (removed as of 10/22/2025)
- ✅ New cosmetics added (f1611e7)
- ✅ Wardrobe page removed, integrated into Customize page (e5d23c5)
- ✅ Functional quest system with daily and story quests (90a3a83)
- ✅ Customization options and cosmetic equipping (90a3a83)
- ✅ Onboarding dialogue with avatar selection (a68b000)
- ✅ Created TopBar component with coin display and profile picture

---

## In Progress (Current Git Status)

### Modified Files
- `client/src/App.tsx`
- `client/src/components/Matrix.tsx`
- `client/src/components/NavigationDrawer.tsx`
- `client/src/components/XPBar.tsx`
- `client/src/constants/cosmetics.ts`
- `client/src/constants/dailyQuests.ts` (quest system refactored - 2025-10-24)
- `client/src/hooks/useProfile.tsx` (quest system refactored - 2025-10-24)
- `client/src/hooks/useTasks.tsx` (cleanup tracking added - 2025-10-24)
- `client/src/components/DailyQuest.tsx` (claimed visual state - 2025-10-24)
- `client/src/pages/Customize.tsx` (cosmetic tracking added - 2025-10-24)
- `client/src/pages/Profile.tsx` (layout structure fixed)
- `client/src/pages/Quests.tsx` (layout structure fixed)
- `client/src/pages/Bazaar.tsx` (layout structure fixed)
- `client/src/pages/Routines.tsx` (layout fixed + routine tracking added - 2025-10-24)
- `shared/schema.ts` (DailyQuest and inbox schemas updated - 2025-10-24)

### New Untracked Files
- `client/public/assets/cosmetics/shirts/shirt-hoodie.png` (new cosmetic asset)
- `client/public/assets/howie-coin.png` (coin icon)
- `client/src/assets/cosmetics/tops/` (cosmetics folder)
- `client/src/components/BrainDumpCard.tsx` (brain dump task container)
- `client/src/components/CoinDisplay.tsx` (coin counter component)
- `client/src/components/DailyQuest.tsx` (daily quest card)
- `client/src/constants/dailyQuests.ts` (quest templates)
- `client/src/pages/Bazaar.tsx` (shop page)

### Deleted Files
- `client/src/components/examples/` (deprecated example components removed - 2025-10-24)
  - Matrix.tsx, NavigationDrawer.tsx, QuadrantCard.tsx, TaskCard.tsx, TaskInput.tsx

**Status:** Daily quest system refactored from template-based to fixed pool rotation (10/24) - TESTED & WORKING! Quest progress tracking verified. Layout padding fixes complete. All pages consistent. Quest tracking integrated across Routines, Customize, and Matrix pages. Inbox system prepared for future use. Ready for commit.

---

## Next Steps / Planned Features

### High Priority
- [ ] Backend persistence (PostgreSQL + Drizzle ORM setup)
- [ ] Multi-user authentication (Passport.js integration)
- [ ] Data migration from localStorage to database

### Medium Priority
- [ ] Inbox/Notification system UI (data structure ready, needs UI implementation)
- [ ] WebSocket real-time features (ws dependency added but unused)
- [ ] Additional cosmetics and quest content
- [ ] Statistics/analytics page (task completion trends)
- [ ] Routine analytics (streak tracking, completion history)
- [ ] Quest history/analytics (track quest completion over time)

### Low Priority / Nice-to-Have
- [ ] Social features (leaderboards, friend comparison)
- [ ] Import/export functionality
- [ ] Mobile app (React Native?)
- [ ] Dark mode theme

---

## Known Issues

- **No backend persistence:** All data stored in localStorage (lost on cache clear)
- **Single user only:** No authentication or multi-user support yet
- **No data backup:** Users can lose all progress
- **WebSocket unused:** Dependency added but not implemented

---

## Key Architecture Notes

### App Layout Structure

**Location:** `client/src/App.tsx`
**Pattern:** Persistent layout wrapper with nested routing

```
App.tsx
└─ Persistent Layout (fixed)
   ├─ NavigationDrawer (w-64, fixed left)
   ├─ TopBar (fixed top, offset left-64)
   └─ Main Content Area (ml-64, pt-16)
      └─ Router (wouter)
         └─ Page Components
```

**Important:** Page components should NOT include their own NavigationDrawer, TopBar, or layout wrappers. They should only return their content with `h-full p-6 md:p-8 overflow-y-auto` classes. See Home.tsx as the reference pattern.

**Layout Classes:**
- Pages: `h-full p-6 md:p-8 overflow-y-auto`
- Max-width containers: Use `max-w-[1150px] mx-auto` or similar as needed

**All pages following this pattern (as of 2025-10-24):**
- ✅ Home.tsx
- ✅ Profile.tsx
- ✅ Customize.tsx
- ✅ Quests.tsx
- ✅ Bazaar.tsx
- ✅ Routines.tsx

### State Management Hooks

**useProfile()** - Located at `client/src/hooks/useProfile.tsx`
- Manages: XP, level, coins, cosmetics, quests, onboarding
- Key functions: `awardXP()`, `addCoins()`, `claimDailyQuest()`, `completeOnboarding()`
- Storage: localStorage key `userProfile`

**useTasks()** - Located at `client/src/hooks/useTasks.tsx`
- Manages: Task CRUD operations, quadrant filtering
- Key functions: `addTask()`, `toggleTaskCompletion()`, `moveTask()`, `deleteCompletedTasks()`
- Storage: localStorage key `tasks`

### XP System

**Formula:** Exponential growth (Runescape-style)
```typescript
// xpCalculator.ts
xpForLevel(level) = Σ floor(i + 300 * 2^(i/7)) for i=1 to level-1
```

**Max Level:** 50
**Level-based Unlocks:** Defined in `constants/cosmetics.ts` via `unlockLevel` property

### Cosmetics System

**Library:** `client/src/constants/cosmetics.ts` - Central registry of all cosmetic items
**Categories:** hat, shirt, pants, cape, pet, facewear

**Unlock Methods (Mutually Exclusive):**
- **Quest Rewards** (`unlockQuest`) - Exclusive cosmetics earned from completing story quests
  - Baseball Cap, Tuxedo, Howerful Glasses
- **Level Rewards** (`unlockLevel`) - Cosmetics automatically unlocked at milestone levels
  - Lv 8: Tabby Cat | Lv 15: Blue Cape | Lv 20: Red Cape | Lv 25: Golden Crown
- **Bazaar Shop** (`coinPrice`) - Cosmetics purchasable with Howie Coins (no level requirement)
  - Blue Jeans (30), Cozy Hoodie (75), Wizard Hat (150), Golden Retriever (300)
- **Default Options** - Free "none" options for each category (always available)

**Rendering:** `LayeredAvatar.tsx` uses z-index stacking order:
```
Cape (z-0) → Pants (z-10) → Shirt (z-20) → Facewear (z-30) → Hat (z-40) → Pet (z-50)
```

### Quest System

**Daily Quests:** Fixed rotation system in `constants/dailyQuests.ts`
- Pool of 8 predefined daily quests
- Each user gets 3 random quests per day (can include duplicates across days)
- Reset at midnight with special handling:
  - Unclaimed completed quests → Rewards moved to inbox
  - Incomplete quests → Progress reset, quest removed
- Progress auto-updates based on quest type (task completion, quadrant-specific, special actions)
- Claimed quests remain visible (faded/crossed out) until midnight
- Quest types: task-completion, quadrant-specific, routine-based, cosmetic-based, cleanup-based

**Quest Pool (8 Total):**
1. Warm Up - Complete 3 tasks (15 coins, 10 XP)
2. Power Hour - Complete 10 tasks (30 coins, 60 XP)
3. Urgent Master - Complete 3 'Urgent' tasks (40 coins, 35 XP)
4. Team Player - Complete 3 'Delegate' tasks (20 coins, 15 XP)
5. Eliminator - Complete 3 'Eliminate' tasks (20 coins, 20 XP)
6. Routine Crusher - Complete 3 daily routines (25 coins, 25 XP)
7. Declutter-er - Use 'Clean Completed Tasks' button (15 coins, 15 XP)
8. Ah... Just Right - Equip a cosmetic (25 coins, 25 XP)

**Story Quests:** Permanent milestone quests
- Tracked via `claimedQuests` array in profile
- Unlock exclusive cosmetics not available in shop

**Inbox System:** (Prepared for future notification center)
- Stores unclaimed quest rewards from expired daily quests
- Rewards: { questId, questName, coinReward, xpReward, timestamp }
- Manual claim required through inbox UI (to be implemented)

### Data Schemas

**Location:** `shared/schema.ts`
**Validation:** Zod schemas for runtime type safety
**Key Types:** `Task`, `UserProfile`, `DailyQuest`, `CosmeticItem`, `Quadrant`, `Workspace`

---

## Session Recovery Instructions

**After `/clear` or API Error 400:**

1. In new session: "Read plan.md and continue from [last section worked on]"
2. Update this file after completing milestones
3. Keep "In Progress" section current with git status
4. Move completed items from "Next Steps" to "Recently Completed"

**Before `/clear`:**
- Update this file with current progress
- Note any architectural decisions made
- Document any gotchas or patterns discovered

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (client + server)
npm run dev

# Build for production
npm run build

# Database operations (when implemented)
npm run db:push
npm run db:studio

# Git workflow
git status
git add .
git commit -m "message"
```

---

**End of Plan Document**
