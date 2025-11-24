# Howerful Development Plan

## 🤖 AI Quick Start
- **Stack**: React + TypeScript + Express + PostgreSQL
- **Key Files**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- **History**: See [docs/CHANGELOG.md](docs/CHANGELOG.md) for complete development history
- **Overview**: See [docs/README.md](docs/README.md) for project overview

---

## Current Sprint: UI/UX Refinement & Focus System

### Recently Completed ✅
1. **Collapsible Sidebar Navigation** - YouTube-style hamburger menu in TopBar, sidebar collapses to icon-only (80px) with tooltips
2. **Focus Page Optimization** - Compact vertical layout, removed custom duration and keyboard shortcuts sections, unified timer card
3. **Button Styling Consistency** - Dynamic shadow colors matching button variants, chunky 3D effects for outline/secondary buttons
4. **Dojo Tab Redesign** - Clean tabs with inactive=transparent, active=white background + colored text
5. **Matrix Page Cleanup** - Removed Brain Dump section, expanded quadrants to full width

### Next Priorities 📋

#### 1. Focus System Enhancements
- Add session history tracking (completed focus sessions)
- Add break notifications and auto-start
- Add daily focus statistics widget
- Add focus streak tracking

#### 2. Quest System Refinement
- Implement quest progress persistence
- Add quest rewards claiming UI
- Add quest notification system
- Add daily/weekly quest reset logic

#### 3. Routine System Implementation
- Create routine editor interface
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

## Design System Status 🎨

### Active Cosmetics System
- **Themes**: Light, Dark (currently hardcoded)
- **Avatars**: Default initial-based avatar (extensible)
- **Banners**: System in place, ready for content
- **Titles**: System in place, ready for content

### Button Variants
- `default` - Primary actions (blue, 3D glass effect)
- `destructive` - Dangerous actions (red, 3D glass effect)
- `outline` - Secondary actions (border, subtle 3D chunky)
- `secondary` - Tertiary actions (muted, subtle 3D chunky)
- `ghost` - Minimal actions (transparent)
- `link` - Text-style actions

### Layout Components
- **NavigationDrawer**: Collapsible sidebar (256px expanded, 80px collapsed)
- **TopBar**: Fixed header with hamburger menu, coins, profile
- **BucketTabs**: Clean tab navigation with badges

---

## API Endpoints Reference

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/complete-onboarding` - Mark onboarding complete

### Daily Spread (Dojo)
- `GET /api/daily-spread` - Get all items
- `POST /api/daily-spread/items` - Add item
- `PUT /api/daily-spread/items/:id` - Update item
- `DELETE /api/daily-spread/items/:id` - Delete item
- `PUT /api/daily-spread/reorder` - Reorder items

### Matrix (Tasks)
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/complete` - Toggle completion

### Focus System
- `POST /api/focus/session` - Start session
- `PUT /api/focus/session/:id` - Update session
- `GET /api/focus/settings` - Get focus settings
- `PUT /api/focus/settings` - Update settings

### Quests
- `GET /api/quests` - Get all quests
- `POST /api/quests/:id/claim` - Claim quest reward

### Routines
- `GET /api/routines` - Get all routines
- `POST /api/routines` - Create routine
- `PUT /api/routines/:id` - Update routine
- `DELETE /api/routines/:id` - Delete routine

### Cosmetics
- `GET /api/cosmetics` - Get all cosmetics
- `POST /api/cosmetics/purchase` - Purchase cosmetic
- `POST /api/cosmetics/equip` - Equip cosmetic

---

## Development Workflow

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
