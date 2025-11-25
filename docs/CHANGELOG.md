# Howerful Development Plan

**Last Updated:** 2025-11-24

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
- **Navigation Drawer:** Fixed sidebar with profile card and page links (Dojo, Matrix, Routines, Quests, Bazaar)
- **Top Bar:** Fixed header with coin display and profile picture
- **XP Bar:** Live progress indicator to next level
- **BarHeader Component:** Reusable gradient header with animations and countdown timers
- **Onboarding Dialog:** Nickname setup for new users
- **Daily Routines Page:** Full implementation with habit tracking, XP rewards, and daily bounty system
- **Dojo Page:** New home page (placeholder for future features)
- **Animations:** Floating XP notifications, confetti on quest completion, particle bursts, shimmer effects
- **Keyboard Shortcuts:** Ctrl+Enter for task creation
- **Developer Tools:** Profile reset, XP injection, level jumping

### Data Persistence ✅
- **Storage:** localStorage for all user data (tasks, profile, quests)
- **Schemas:** Zod validation in `shared/schema.ts`

---

## Recently Completed (Git History)

- ✅ **Focus Session History & Bullet Journal Refactoring** (2025-11-24) - Session tracking, unified terminology, and XP integration
  - **Focus Session History**: Added persistent localStorage tracking for all completed focus sessions
    - Created `FocusHistory.tsx` component displaying last 10 sessions with completion status, duration, and relative timestamps
    - Added session persistence to `useFocus.tsx` with localStorage key "howerful-focus-sessions"
    - Integrated history display into Focus page below Quick Start section
    - Shows phase type with color coding (work=primary, short break=blue, long break=purple)
  - **Bullet Journal Refactoring**: Renamed all DailySpread terminology to BulletJournal/BulletItem across entire codebase
    - Renamed `DailySpreadItem.tsx` → `BulletItem.tsx`
    - Renamed `useDailySpread.tsx` → `useBulletJournal.tsx`
    - Updated schema.ts types: `DailySpreadItem` → `BulletItem`, `DailySpreadItemType` → `BulletItemType`
    - Changed localStorage key: "howerful-daily-spread" → "howerful-bullet-journal"
    - Added legacy type aliases for backward compatibility
    - Updated all imports across BucketView, DailySpread, Dojo, and useFocus
  - **XP System Integration for Dojo**: Added gamification rewards for bullet journal task completion
    - Added `BULLET_TASK_XP_REWARD = 10` and `BULLET_TASK_COIN_REWARD = 5` to schema.ts
    - Modified `toggleItemCompletion` in useBulletJournal to accept onComplete/onUncomplete callbacks
    - Integrated XP rewards in Dojo.tsx with level-up celebration toasts
    - Now both Matrix and Dojo tasks award XP, creating unified gamification system
  - **Task Input Unification**: Standardized input behavior across Matrix and Dojo
    - Changed Dojo input from `w-full text-base font-mono` to `h-12 text-base` (matches Matrix)
    - Updated Matrix TaskInput keyboard shortcut from Ctrl+Enter to "/" (matches Dojo)
    - Added autofocus to Matrix TaskInput
    - Removed tip text from both inputs, moved to Matrix page top
    - Unified visual hints (single "/" kbd badge instead of two-key combo)
  - **File Structure Cleanup**: Resolved naming confusion between page and component files
    - Renamed `client/src/pages/Home.tsx` → `client/src/pages/Matrix.tsx`
    - Renamed `client/src/components/Matrix.tsx` → `client/src/components/MatrixGrid.tsx`
    - Updated imports in App.tsx routing
    - Matrix page at /matrix now properly named throughout codebase
  - **Matrix Page UX Improvements**:
    - Moved TaskInput to top of page with tip text
    - Removed TaskInput from bottom of page
    - Hidden "Clean Completed Tasks" section for future repurposing
    - Changed tip instructions to mention "/" shortcut instead of Ctrl+Enter
  - **Files created**: `client/src/components/FocusHistory.tsx`
  - **Files renamed**:
    - `client/src/components/DailySpreadItem.tsx` → `client/src/components/BulletItem.tsx`
    - `client/src/hooks/useDailySpread.tsx` → `client/src/hooks/useBulletJournal.tsx`
    - `client/src/pages/Home.tsx` → `client/src/pages/Matrix.tsx`
    - `client/src/components/Matrix.tsx` → `client/src/components/MatrixGrid.tsx`
  - **Files modified**:
    - `shared/schema.ts` (BulletItem types, XP rewards)
    - `client/src/hooks/useFocus.tsx` (session persistence)
    - `client/src/hooks/useBulletJournal.tsx` (completion callbacks)
    - `client/src/pages/Focus.tsx` (history display)
    - `client/src/pages/Dojo.tsx` (XP integration)
    - `client/src/pages/Matrix.tsx` (renamed from Home.tsx)
    - `client/src/components/MatrixGrid.tsx` (renamed from Matrix.tsx, TaskInput moved)
    - `client/src/components/TaskInput.tsx` (keyboard shortcut change)
    - `client/src/components/BucketView.tsx` (import updates)
    - `client/src/components/DailySpread.tsx` (import updates)
    - `client/src/App.tsx` (routing update)

- ✅ **Pomodoro Focus Mode System** (2025-11-12) - Complete Pomodoro-style timer system with dual entry points
  - **Two Entry Points**:
    - **Dedicated /focus Page**: Full-featured focus mode with preset timers (5min, 10min, 25min) and custom duration up to 4 hours
    - **Inline Focus from Dojo**: Right-click context menu option and drag-and-drop to Focus Space
  - **Focus Space Drop Zone**: Animated drop target at bottom of screen (only visible when dragging bullets)
    - Smooth slide-up entrance/exit animations
    - Glow effect and scale animation when hovering
    - One-step focus initiation via drag-and-drop
  - **FocusedItemBanner**: Persistent banner at top of Dojo showing active focus session
    - Live countdown timer with phase indicator (work/short break/long break)
    - Phase-specific colors (work: primary, short break: green, long break: blue)
    - Compact controls (Play/Pause/Finish)
    - Link to full Focus page for more options
    - Pulsing icon animation when timer is running
  - **Switch Focus Dialog**: Y/N confirmation when attempting to focus on new item while session is active
    - Shows current and new task text
    - Keyboard shortcuts (Y to confirm, N to cancel)
    - Prevents accidental focus switching
  - **Global Timer State**: FocusProvider following ProfileProvider pattern
    - Timer persists across page navigation and browser reloads
    - localStorage with timestamp-based recovery (calculates elapsed time)
    - Automatic task completion when work session finishes
    - Pomodoro phases: 25min work → 5min short break → 15min long break (after 4 sessions)
    - Tracks work sessions completed, focus history, and settings
  - **Circular Progress Timer**: Custom SVG progress ring with animations
    - Three size variants (small, medium, large)
    - Phase-specific colors with smooth transitions
    - Pulsing animation during active countdown
    - Formatted time display (HH:MM:SS or MM:SS)
  - **Focus Controls**: Context-aware control buttons
    - Play/Pause (changes based on timer state)
    - Skip Phase (advance to next break/work period)
    - Finish Early (with confirmation dialog)
    - Compact and default variants for different contexts
  - **Drag & Drop Integration**: Lifted DndContext to Dojo page level
    - Enables cross-component dragging from BucketView to FocusDropZone
    - Drop handlers check for 'focus-zone' ID to initiate focus sessions
    - Maintains existing bullet reordering functionality
  - **Visual Feedback Enhancements**:
    - Context menu shows 1px primary-colored ring on bullet item when open
    - Clear visual indication of which item is being acted upon
    - Smooth animations throughout focus interactions
  - **Data Schema Updates**:
    - Added focus tracking fields to DailySpreadItem: `focusState`, `focusStartedAt`, `focusCompletedAt`, `pomodorosCompleted`, `estimatedPomodoros`
    - Created FocusSession schema for session history tracking
    - Created FocusSettings interface for timer customization
  - **Files created**:
    - `client/src/hooks/useFocus.tsx` (global timer state management)
    - `client/src/components/FocusTimer.tsx` (circular SVG progress ring)
    - `client/src/components/FocusControls.tsx` (control buttons with dialogs)
    - `client/src/pages/Focus.tsx` (dedicated focus mode page)
    - `client/src/components/FocusDropZone.tsx` (animated drag target)
    - `client/src/components/FocusedItemBanner.tsx` (Dojo banner with timer)
    - `client/src/components/SwitchFocusDialog.tsx` (Y/N confirmation dialog)
  - **Files modified**:
    - `shared/schema.ts` (focus tracking fields added)
    - `client/src/App.tsx` (FocusProvider wrapper, /focus route)
    - `client/src/components/NavigationDrawer.tsx` (Focus nav item with Timer icon)
    - `client/src/pages/Dojo.tsx` (lifted DndContext, focus handlers, banner integration)
    - `client/src/components/BucketView.tsx` (removed DndContext, added onStartFocus prop)
    - `client/src/components/DailySpreadItem.tsx` (context menu item, visual focus state)

- ✅ **Temporal Bucket System Implementation** (2025-11-09) - Replaced date-based planning with ADHD-friendly temporal buckets
  - **Three-Bucket System**: Today, Tomorrow, Someday (replaces traditional date assignments)
    - **Today**: Active tasks and events for immediate attention
    - **Tomorrow**: Items planned for the next day
    - **Someday**: Backlog/idea storage without guilt or pressure
  - **Folder-Style Tab Navigation**: Visual tabs styled like filing folder tops with count badges
    - Active tab highlighted with shadow and connected bottom border
    - Smooth Framer Motion transitions between tabs
    - Disabled [+] button placeholder for future custom collections
  - **Quick Action Chips**: Hover-reveal buttons on each item for one-click bucket moves
    - Today items: Show [→ Tomorrow] and [⏭ Someday]
    - Tomorrow items: Show [← Today] and [⏭ Someday]
    - Someday items: Show [← Today] and [→ Tomorrow]
    - Subtle styling prevents distraction from main content
  - **Natural Language Bucket Detection**: Enhanced parser recognizes bucket keywords
    - "tomorrow: meeting" → automatically routes to Tomorrow bucket
    - "someday learn piano" → routes to Someday bucket
    - "today: call dentist" → explicit Today routing
    - Works alongside existing type/time detection
  - **Someday Backlog Metadata**: Timestamps track when items moved to Someday
    - Shows relative time: "Added to backlog 3 days ago"
    - Helps identify stale items without creating shame
    - Only visible in Someday bucket view
  - **Bucket-Specific Features**:
    - Date header and streak only show in Today view
    - Scheduled sections in Today and Tomorrow (events with times)
    - Someday uses simple list without scheduled separation
    - Drag-and-drop reordering within each bucket
  - **Data Schema Updates**:
    - Added `bucket` field (today/tomorrow/someday) to DailySpreadItem
    - Added `movedToSomedayAt` timestamp for backlog tracking
    - Made `date` field optional (only needed for scheduled events)
    - Backward compatible - existing items will work with defaults
  - **Files created**:
    - `client/src/components/BucketTabs.tsx` (folder-style tab navigation)
    - `client/src/components/BucketView.tsx` (bucket content display)
    - `client/src/utils/relativeTime.ts` (timestamp formatting)
  - **Files modified**:
    - `shared/schema.ts` (bucket fields added)
    - `client/src/hooks/useDailySpread.tsx` (bucket functions)
    - `client/src/pages/Dojo.tsx` (tab switching logic)
    - `client/src/components/DailySpreadItem.tsx` (quick action chips)
    - `client/src/utils/bulletDetection.ts` (bucket keyword parsing)
    - `client/src/utils/streakCalculator.ts` (works with bucket system)

- ✅ **Daily Spread ADHD-Optimized Redesign** (2025-11-08) - Complete overhaul with natural language processing and dopamine-driven feedback
  - **Natural Language Processing**: Auto-detects bullet types from plain text input
    - Tasks: "call dentist", "buy milk", "fix bug"
    - Events: "meeting at 2pm", "lunch tomorrow 1:30", time patterns automatically detected
    - Notes: "remember that...", "idea: ...", "note: ..."
    - Priority detection: "buy milk !!" marks as high priority
  - **Command-Line Interface**: Keyboard-first design for rapid capture
    - **"/" key**: Global shortcut to focus input from anywhere on the page
    - Enter key for instant capture (no modifier keys needed)
    - Shift+Enter to capture and open detail view
    - Monospace font for command-line aesthetic
    - Placeholder: "What's on your mind? (Press / to focus, Enter to capture)"
  - **Dopamine-Driven Feedback**:
    - Smooth slide-in animations (20px from left) when items are added
    - Running count displays "X thoughts captured today"
    - Streak tracking with ADHD-friendly recovery messaging
    - Encouraging messages: "Great start! One day at a time 🌱", "Personal record: X days! 🔥"
    - Shows current streak with fire icon, plus best streak if different
  - **Drag-and-Drop Visual Feedback** (2025-11-08):
    - Glowing primary-colored line indicator shows where dragged bullet will drop
    - Item being hovered over has subtle background highlight
    - Dragged item becomes semi-transparent (50% opacity)
    - Smooth transitions for visual clarity
  - **Streak System Features**:
    - One-day forgiveness for ADHD-friendly streak calculation
    - Progress over perfection messaging ("Ready for a fresh start? Your best was X days!")
    - No shame for broken streaks - celebrates any progress
  - **Scheduled Today Section** (2025-11-08):
    - Events with times automatically separated from general bullets
    - Appears in dedicated "SCHEDULED TODAY" section below general items
    - Sorted chronologically by time (earliest first)
    - Border separator visually distinguishes scheduled events
    - Still fully draggable and editable like general items
  - **Page Structure** (2025-11-08):
    - Date header moved to Dojo page level (no longer in DailySpread component)
    - "Today, [Date]" is now the main H1 page header with calendar icon
    - Removed "The Dojo" title - date is the primary header
    - Task entry input moved from floating bottom position to top of page (between header and list)
    - Input now managed by Dojo page, not DailySpread component
    - "/" keyboard shortcut moved to Dojo page level for global access
  - **Files created**: `client/src/utils/bulletDetection.ts`, `client/src/utils/streakCalculator.ts`
  - **Files modified**: `client/src/components/DailySpread.tsx`, `client/src/components/DailySpreadItem.tsx`, `client/src/hooks/useDailySpread.tsx`, `client/src/pages/Dojo.tsx`
- ✅ **Daily Spread Bullet Journal Implementation** (2025-11-08) - Built ADHD-friendly bullet journal system in Dojo (Initial version)
  - Implemented floating input at bottom of screen with Ctrl+Enter to add items
  - Items appear at top of list (newest first) with drag-and-drop reordering via @dnd-kit
  - Three bullet types: Tasks (✓), Events (○), Notes (-)
  - Signifiers can be cycled by clicking the icon
  - Tasks: Single-click text to toggle completion, double-click to edit
  - Events/Notes: Single-click text to edit
  - Drag handle (GripVertical icon) for manual reordering
  - Date header shows current day with calendar icon
  - Added `order` field to schema for persistent custom sorting
  - **Files created:** `client/src/components/DailySpread.tsx`, `client/src/components/DailySpreadItem.tsx`, `client/src/hooks/useDailySpread.tsx`
  - **Files modified:** `shared/schema.ts` (added dailySpreadItemSchema with order field), `client/src/pages/Dojo.tsx`
- ✅ **Dojo Page & Navigation Restructure** (2025-11-08) - Created new home page and reorganized routes
  - Created new Dojo page (`client/src/pages/Dojo.tsx`) as the new home/landing page
  - Moved Matrix (Eisenhower task management) from `/` to `/matrix`
  - Updated navigation drawer to show: Dojo → Matrix → Routines → Quests → Bazaar
  - Dojo page uses placeholder content, ready for future feature implementation
  - **Files created:** `client/src/pages/Dojo.tsx`
  - **Files modified:** `client/src/App.tsx`, `client/src/components/NavigationDrawer.tsx`
- ✅ **Custom XP Icon Implementation** (2025-10-24) - Replaced Lucide icon with custom design
  - Replaced Sparkles icon with custom XP icon in DailyQuest component
  - Custom 36x36px icon scaled to 16x16px to match coin icon sizing
  - Maintains visual consistency with other reward icons
  - **Files created:** `client/src/assets/xp-icon.png`
  - **Files modified:** `client/src/components/DailyQuest.tsx`
- ✅ **BarHeader Component & UI Enhancements** (2025-10-24) - Created reusable header component with live countdown timers
  - **New BarHeader Component** (`client/src/components/BarHeader.tsx`) - Visually striking header for content sections
    - Gradient backgrounds with 4 variant styles (primary, success, warning, gradient)
    - Animated entrance effects (slide-in + fade) using Framer Motion
    - Subtle shimmer animation across background
    - Flexible content slots for icons (left) and custom metadata (right)
    - Includes `TimerBadge` subcomponent with pulsing glow effect
  - **New Timer Utility** (`client/src/utils/timeUntilMidnight.ts`) - React hook for countdown timers
    - `useTimeUntilMidnight()` hook that updates every second
    - Calculates time remaining until next midnight
    - Returns formatted string (e.g., "22h 31m") and breakdown (hours, minutes, seconds)
  - **Daily Quests UI Redesign** - Applied BarHeader to Quests page
    - Replaced simple header with prominent gradient BarHeader
    - Added live countdown timer showing time until quest reset
    - Wrapped quest cards in padded container with matching borders
    - Enhanced visual hierarchy - header immediately draws attention
  - **Home Page Layout Redesign** (`client/src/components/Matrix.tsx`) - Improved TaskInput positioning
    - Moved TaskInput from full-width bottom position to sit directly under Quadrants Grid only
    - Brain Dump now extends full height on left side
    - Better visual clarity - TaskInput only applies to quadrants, not Brain Dump
    - Improved layout structure with flex column wrapping
  - **Files created:** `client/src/components/BarHeader.tsx`, `client/src/utils/timeUntilMidnight.ts`
  - **Files modified:** `client/src/pages/Quests.tsx`, `client/src/components/Matrix.tsx`
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
- `client/src/App.tsx` (Focus route and FocusProvider added - 2025-11-12; Dojo route added, Matrix moved to /matrix - 2025-11-08)
- `client/src/components/NavigationDrawer.tsx` (Focus nav item added - 2025-11-12; Dojo nav item added - 2025-11-08)
- `client/src/pages/Dojo.tsx` (Focus integration with lifted DndContext - 2025-11-12)
- `client/src/components/BucketView.tsx` (Focus integration, DndContext removed - 2025-11-12)
- `client/src/components/DailySpreadItem.tsx` (Focus context menu item, visual focus state - 2025-11-12)
- `client/src/components/Matrix.tsx` (TaskInput repositioned - 2025-10-24)
- `client/src/components/XPBar.tsx`
- `client/src/constants/cosmetics.ts`
- `client/src/constants/dailyQuests.ts` (quest system refactored - 2025-10-24)
- `client/src/hooks/useProfile.tsx` (quest system refactored - 2025-10-24)
- `client/src/hooks/useTasks.tsx` (cleanup tracking added - 2025-10-24)
- `client/src/components/DailyQuest.tsx` (custom XP icon added - 2025-10-24)
- `client/src/pages/Customize.tsx` (cosmetic tracking added - 2025-10-24)
- `client/src/pages/Profile.tsx` (layout structure fixed)
- `client/src/pages/Quests.tsx` (BarHeader added with countdown timer - 2025-10-24)
- `client/src/pages/Bazaar.tsx` (layout structure fixed)
- `client/src/pages/Routines.tsx` (layout fixed + routine tracking added - 2025-10-24)
- `shared/schema.ts` (Focus tracking fields added - 2025-11-12; DailyQuest and inbox schemas updated - 2025-10-24)

### New Untracked Files
- `client/src/hooks/useFocus.tsx` (global focus timer state management - 2025-11-12)
- `client/src/components/FocusTimer.tsx` (circular SVG progress ring - 2025-11-12)
- `client/src/components/FocusControls.tsx` (focus control buttons - 2025-11-12)
- `client/src/pages/Focus.tsx` (dedicated focus mode page - 2025-11-12)
- `client/src/components/FocusDropZone.tsx` (animated drag target - 2025-11-12)
- `client/src/components/FocusedItemBanner.tsx` (Dojo focus banner - 2025-11-12)
- `client/src/components/SwitchFocusDialog.tsx` (Y/N confirmation dialog - 2025-11-12)
- `client/src/components/BucketTabs.tsx` (temporal bucket tab navigation - 2025-11-09)
- `client/src/components/BucketView.tsx` (bucket content display - 2025-11-09)
- `client/src/utils/relativeTime.ts` (relative timestamp formatting - 2025-11-09)
- `client/src/pages/Dojo.tsx` (new home page - 2025-11-08)
- `client/src/components/DailySpread.tsx` (deprecated - replaced by BucketView)
- `client/src/components/DailySpreadItem.tsx` (updated with bucket and focus features - 2025-11-12)
- `client/src/hooks/useDailySpread.tsx` (updated with bucket functions - 2025-11-09)
- `client/src/components/BarHeader.tsx` (reusable header component with animations - 2025-10-24)
- `client/src/utils/timeUntilMidnight.ts` (countdown timer utility hook - 2025-10-24)
- `client/src/utils/bulletDetection.ts` (updated with bucket parsing - 2025-11-09)
- `client/src/utils/streakCalculator.ts` (updated for bucket system - 2025-11-09)
- `client/src/assets/xp-icon.png` (custom XP reward icon - 2025-10-24)
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

**Status:** Focus Mode implementation complete (11/12) - Successfully implemented Pomodoro-style timer system with dual entry points:
- ✅ Dedicated /focus page with preset and custom timers
- ✅ Inline focus from Dojo (right-click context menu + drag-and-drop)
- ✅ Animated Focus Space drop zone (appears when dragging)
- ✅ FocusedItemBanner in Dojo with live countdown
- ✅ Switch Focus Dialog with Y/N keyboard shortcuts
- ✅ Global timer state persists across navigation and reloads
- ✅ Circular SVG progress timer with phase-specific colors
- ✅ Focus controls (Play/Pause/Skip/Finish) with confirmation dialogs
- ✅ Lifted DndContext for cross-component dragging
- ✅ Visual feedback (1px ring on context menu open)
- ✅ Automatic task completion when work session finishes

**Status:** Temporal Bucket System implementation complete (11/09) - Successfully replaced date-based planning with ADHD-friendly bucket system:
- ✅ Three temporal buckets (Today, Tomorrow, Someday) replace traditional dates
- ✅ Folder-style tab navigation with count badges
- ✅ Quick action chips for one-click bucket moves (hover to reveal)
- ✅ Natural language bucket detection ("tomorrow: task" auto-routes)
- ✅ Someday backlog metadata with relative timestamps
- ✅ Bucket-specific features (date/streak in Today only)
- ✅ Scheduled sections in Today and Tomorrow buckets
- ✅ Drag-and-drop reordering within each bucket
- ✅ All previous Daily Spread features preserved:
  - ✅ Natural language processing for bullet type detection
  - ✅ Command-line style interface with "/" shortcut
  - ✅ Enter for instant capture
  - ✅ Dopamine-driven feedback and streak tracking
  - ✅ Drop indicators for drag-and-drop
- 🔄 Shift+Enter to capture and open detail view (TODO: detail view UI)
- 🔄 Sound effects (optional) - Not yet implemented
- 🔄 Custom collections ([+] button placeholder added)

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

**All pages following this pattern (as of 2025-11-08):**
- ✅ Dojo.tsx (new home page at `/`)
- ✅ Home.tsx (Matrix page, moved to `/matrix`)
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

**useFocus()** - Located at `client/src/hooks/useFocus.tsx`
- Manages: Pomodoro timer state, focus sessions, timer settings
- Key functions: `startTimer()`, `pauseTimer()`, `resumeTimer()`, `finishEarly()`, `skipPhase()`
- Storage: localStorage key `focusState` (with timestamp-based recovery)
- **Timer Persistence:** On page reload, calculates elapsed time since last save and resumes timer with adjusted remainingSeconds
- **Automatic Integration:** Tasks auto-complete when work session finishes, updates DailySpreadItem focusState
- **Pomodoro Phases:** 25min work → 5min short break → 15min long break (after 4 work sessions)
- **Settings:** Customizable work/break durations, auto-start options, sound/notification preferences
- **Provider Pattern:** FocusProvider wraps entire app in App.tsx (same pattern as ProfileProvider)

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
**Key Types:** `Task`, `UserProfile`, `DailyQuest`, `CosmeticItem`, `Quadrant`, `Workspace`, `FocusSession`, `DailySpreadItem` (with focus fields)

### Focus Mode System

**Architecture:** Pomodoro-style timer with dual entry points and persistent state

**Entry Points:**
1. **Dedicated /focus Page** - Full-featured timer with preset buttons (5/10/25min) and custom duration input (up to 4 hours)
2. **Inline from Dojo** - Right-click context menu "Start Focus Session" OR drag bullet to Focus Space drop zone

**Key Components:**
- **FocusProvider** (`client/src/hooks/useFocus.tsx`) - Global state wrapper in App.tsx
- **FocusTimer** (`client/src/components/FocusTimer.tsx`) - Circular SVG progress ring with phase colors
- **FocusControls** (`client/src/components/FocusControls.tsx`) - Play/Pause/Skip/Finish buttons
- **FocusDropZone** (`client/src/components/FocusDropZone.tsx`) - Animated drop target (only visible when dragging)
- **FocusedItemBanner** (`client/src/components/FocusedItemBanner.tsx`) - Top banner in Dojo showing active session
- **SwitchFocusDialog** (`client/src/components/SwitchFocusDialog.tsx`) - Y/N confirmation when switching tasks

**Timer Persistence:**
- Saved to localStorage with `sessionStartedAt` timestamp
- On reload: calculates elapsed time and resumes with adjusted `remainingSeconds`
- If time expired while away: resets to initial state

**Drag & Drop Integration:**
- DndContext lifted to Dojo.tsx parent level (enables cross-component dragging)
- Drop handler checks for `over.id === 'focus-zone'` to initiate focus sessions
- Maintains existing bullet reordering within BucketView via SortableContext

**Focus State Tracking:**
- Added to DailySpreadItem schema: `focusState`, `focusStartedAt`, `focusCompletedAt`, `pomodorosCompleted`
- Task auto-completes when work session finishes (updates `completed` and `focusCompletedAt`)

**Visual Feedback:**
- Phase-specific colors: work (primary), short break (green), long break (blue)
- Pulsing icon animation during active timer
- 1px primary-colored ring on bullet when context menu is open
- Smooth Framer Motion animations for all transitions

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
