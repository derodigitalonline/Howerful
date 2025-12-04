# Howerful Changelog

**Last Updated:** 2025-12-04

---

## Project Overview

**Howerful** is a gamified task management web app for ADHD/neurodivergent users. Complete tasks in your Bullet Journal to earn XP and Howie Coins, level up (max level 50), unlock cosmetics for your 3D companion Howie, and complete daily/story quests.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind + Supabase (PostgreSQL)
**Key Libraries:** React Query, Framer Motion, @dnd-kit, Three.js/React Three Fiber

---

## Current Features

### Pages
- **Dojo** - Bullet journal with temporal buckets (Today/Tomorrow/Someday/Future Log)
- **Focus** - Pomodoro timer with right-click start flow and duration selection
- **Routines** - Daily habit tracking with streak system
- **Quests** - Daily quests (3/day from pool of 8) + Story quests
- **Bazaar** - Cosmetics shop (hats, shirts, pants, capes, pets, facewear)
- **Profile** - 3D Howie viewer with stats (tasks completed, quests completed, coins, level/XP)
- **Customize** - Equip cosmetics on 3D Howie model

### Core Systems
- **Bullet Journal** - Task/event system simplified to tasks-only with optional time
- **Gamification** - XP/leveling (max 50), Howie Coins currency, quest rewards
- **3D Avatar** - Three.js viewer with cosmetic attachments, pixelation shader, bone-based facewear
- **Focus Mode** - Context menu start flow, custom duration, fullscreen start page
- **Data Persistence** - Supabase (PostgreSQL) for profiles, cosmetics, daily quests
- **Authentication** - Supabase Auth with guest mode fallback

---

## Recent Changes

### December 2025
- **Focus Session UX** - Right-click context menu on tasks, fullscreen start page with duration selection (5/10/25 min + custom), gamified BEGIN button
- **Context Menu** - Added "Start Focus Session" and "Archive" options to BulletCard
- **Task Type Simplification** - Removed event/task distinction, everything is a task with optional time
- **Bazaar Sync Fixes** - Coin deduction and cosmetic unlocks now sync to Supabase
- **Daily Quest Tracking** - Fixed cosmetic-based quest completion (equipping cosmetics now triggers progress)
- **Bucket Count Fixes** - Badges show only uncompleted, non-archived tasks
- **3D Cosmetics** - Added Howerful Glasses with attachment_face bone support
- **Profile Page Redesign** - Compact XP bar, new stats grid (Tasks Tracked, Quests Completed, Howie Coins)
- **Supabase Integration** - Migrated profile, cosmetics, daily quests from localStorage to PostgreSQL
- **Database Schema** - Added `totalQuestsCompleted`, `bulletTasksCompleted`, `focusSessionsCompleted` tracking

### November 2025
- **Focus Session History** - Added persistent tracking for completed Pomodoro sessions
- **Bullet Journal Refactoring** - Renamed DailySpread → BulletJournal across codebase
- **XP System Integration** - Unified XP rewards for both Matrix and Dojo tasks
- **Pomodoro Focus Mode** - Complete timer system with drag-and-drop integration
- **Temporal Bucket System** - Today/Tomorrow/Someday buckets replace date-based planning
- **Natural Language Parsing** - Auto-detect task types, times, priorities from plain text
- **Dojo Page Created** - New home page with bullet journal as primary interface

---

## Next Steps

### High Priority
- [ ] Complete Supabase migration (tasks, quests, cosmetics)
- [ ] Multi-user authentication improvements
- [ ] Inbox/Notification system UI
- [ ] Quest completion tracking improvements

### Medium Priority
- [ ] Statistics/analytics page (task completion trends)
- [ ] Additional cosmetics and quest content
- [ ] Routine analytics (streak tracking, completion history)
- [ ] Mobile responsiveness improvements

### Nice-to-Have
- [ ] Social features (leaderboards, friend comparison)
- [ ] Import/export functionality
- [ ] Dark mode improvements
- [ ] Sound effects for gamification events

---

## Known Issues

- Tasks/quests still in localStorage (Supabase migration pending)
- No data backup for localStorage data
- Mobile responsiveness needs improvement

---

## Key Architecture Notes

### File Structure
- **Pages:** `client/src/pages/` - All pages use `h-full p-6 md:p-8 overflow-y-auto` pattern
- **Components:** `client/src/components/` - Reusable UI components
- **Hooks:** `client/src/hooks/` - Custom React hooks (useProfile, useTasks, useFocus)
- **Schemas:** `shared/schema.ts` - Zod validation for all data types
- **Constants:** `client/src/constants/` - Cosmetics, quests, XP formulas

### State Management Hooks
- **useProfile()** - XP, level, coins, cosmetics, quests (Supabase + localStorage)
- **useTasks()** - Matrix task CRUD operations (localStorage)
- **useBulletJournal()** - Dojo bullet items CRUD (localStorage)
- **useFocus()** - Pomodoro timer state with persistence
- **useRoutines()** - Daily habit tracking

### XP System
- Exponential curve (Runescape-inspired), max level 50
- Formula: `xpForLevel(level) = Σ floor(i + 300 * 2^(i/7))`
- Tasks award XP: Do First (20), Schedule (10), Delegate (10), Eliminate (5)
- Bullet tasks award 10 XP, 5 coins

### Cosmetics System
- 6 categories: hat, shirt, pants, cape, pet, facewear
- 3 unlock methods: Quest rewards, Level milestones, Bazaar shop
- 3D rendering via Three.js with attachment bones
- Defined in `client/src/constants/cosmetics.ts`

### Quest System
- **Daily Quests:** 3 random quests/day from pool of 8, reset at midnight
- **Story Quests:** Permanent quests with exclusive cosmetic rewards
- **Inbox:** Unclaimed rewards stored when quests expire
- Quest types: task-completion, quadrant-specific, routine-based, cosmetic-based, cleanup-based

### Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Run dev server (client + server)
npm run build        # Build for production
git status           # Check git status
```

---

**End of Changelog**
