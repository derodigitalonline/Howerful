# Howerful Changelog

**Last Updated:** 2025-012-09

### December 2025
- **XP Bar Colors** - Added classic gaming XP bar feel to profile bar
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