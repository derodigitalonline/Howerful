# Howerful Development Plan

## 🤖 AI Quick Start
- **Stack**: React + TypeScript + Supabase (PostgreSQL + Auth + RLS)
- **Quick Reference**: See [docs/PRIMER.md](docs/PRIMER.md) for compact codebase overview
- **API Details**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for endpoints, hooks, schemas
- **System Design**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical architecture
- **Setup**: See [docs/SETUP.md](docs/SETUP.md) for installation and configuration

---

## Current Sprint: UI/UX Refinement & Focus System

### Recently Completed ✅
1. **Focus Session History Tracking** - Added persistent session history with localStorage and comprehensive UI component (FocusHistory.tsx)
2. **Bullet Journal Refactoring** - Renamed all DailySpread terminology to BulletJournal/BulletItem across codebase, added legacy type aliases for backward compatibility
3. **XP System Integration for Dojo** - Added XP/coin rewards for bullet journal task completion, unified gamification across Matrix and Dojo
4. **Task Input Unification** - Unified Dojo and Matrix inputs with identical h-12 styling, "/" keyboard shortcut, autofocus behavior
5. **File Structure Cleanup** - Renamed Home.tsx → Matrix.tsx page, Matrix.tsx → MatrixGrid.tsx component for clarity
6. **Collapsible Sidebar Navigation** - YouTube-style hamburger menu in TopBar, sidebar collapses to icon-only (80px) with tooltips
7. **Focus Page Optimization** - Compact vertical layout, removed custom duration and keyboard shortcuts sections, unified timer card
8. **Button Styling Consistency** - Dynamic shadow colors matching button variants, chunky 3D effects for outline/secondary buttons
9. **Dojo Tab Redesign** - Clean tabs with inactive=transparent, active=white background + colored text
10. **Matrix Page Cleanup** - Removed Brain Dump section, expanded quadrants to full width, moved task input to top

### Next Priorities 📋

#### 1. Focus System Enhancements
- Add break notifications and auto-start
- Add daily focus statistics widget
- Add focus streak tracking

#### 2. Quest System Refinement
- Implement quest progress persistence
- Add quest rewards claiming UI
- Add quest notification system
- Add daily/weekly quest reset logic

#### 3. Routine System Update
- Add routine execution tracking
- Add routine streak visualization
- Add routine completion rewards

#### 4. Matrix Features
- Add task filtering (by priority, due date)
- Add task search functionality
- Add bulk task operations
- Add task templates

#### 5. Profile & Progression
- Add XP gain animations
- Add level-up celebration modal
- Add achievement showcase
- Add stats dashboard (tasks completed, focus time, streaks)

---

## Known Blockers 🚧

None currently - all systems operational.

---

## Technical Debt 🔧

### High Priority
- Add error boundaries for better error handling
- Implement proper loading states for all async operations
- Add input validation for all forms

### Medium Priority
- Optimize re-renders in Matrix component (React.memo for BucketItem)
- Add proper TypeScript types for all API responses
- Implement proper error logging system

### Low Priority
- Add unit tests for utility functions
- Add E2E tests for critical user flows
- Optimize bundle size (code splitting)

---

## Development Workflow

> **Note:** For complete API reference (endpoints, hooks, schemas), see [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

### Local Development
```bash
npm run dev    # Start both client and server
```

### Testing Changes
1. Test locally first
2. Commit changes with descriptive messages
3. Push to GitHub (triggers Vercel deployment)
4. Verify production deployment

### Deployment
- **Platform**: Vercel
- **Auto-deploy**: Pushes to main branch
- **Database**: Neon PostgreSQL (production)
- **Config**: See `vercel.json` and `.env.production`

---

## Quick Commands

```bash
# Database
npm run db:push           # Push schema changes
npm run db:seed           # Seed database

# Development
npm run dev               # Start dev servers
npm run build             # Build for production

# Git
git status                # Check status
git add .                 # Stage changes
git commit -m "message"   # Commit changes
git push                  # Deploy to Vercel
```
