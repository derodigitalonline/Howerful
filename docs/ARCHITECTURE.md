# Howerful Architecture

> **Quick Reference:** For compact overview, see [PRIMER.md](PRIMER.md)
> **API Details:** For complete database schema and endpoints, see [API_REFERENCE.md](API_REFERENCE.md)

## System Overview

Howerful is a gamified productivity app that combines task management, focus sessions, and habit tracking with RPG-style progression mechanics.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit
- **Routing**: Wouter
- **State Management**: React Query + Context API

---

## Core Systems

### 1. Daily Spread (Dojo)
**Purpose**: Brain dump and task triage system inspired by bullet journaling.

**Features**:
- Three buckets: Today, Tomorrow, Someday
- Bullet types: Task (•), Event (○), Note (-)
- Natural language parsing (e.g., "tomorrow: buy milk")
- Drag & drop reordering and bucket changes
- Drag items to Focus Zone to start focus session

**Key Components**:
- `pages/Dojo.tsx` - Main page with DnD context
- `components/BucketTabs.tsx` - Tab navigation
- `components/BucketView.tsx` - Item list with drag/drop
- `components/BucketItem.tsx` - Individual item with actions
- `hooks/useDailySpread.ts` - Data management

**Database**: `daily_spread_items` table

---

### 2. Matrix (Task Management)
**Purpose**: Eisenhower Matrix for prioritizing tasks.

**Features**:
- Four quadrants: Urgent+Important, Not Urgent+Important, Urgent+Not Important, Not Urgent+Not Important
- Drag & drop between quadrants
- Task completion with XP rewards
- Task editing and deletion
- Personal vs Work matrices (workspace isolation)

**Key Components**:
- `pages/Home.tsx` - Matrix page with task input
- `components/Matrix.tsx` - Main matrix with quadrants
- `components/MatrixQuadrant.tsx` - Individual quadrant
- `components/TaskItem.tsx` - Task card with actions
- `hooks/useTasks.ts` - Task management

**Database**: `tasks` table

---

### 3. Focus System
**Purpose**: Pomodoro-style focus sessions with time tracking.

**Features**:
- Configurable work/break durations
- Session type cycle: Work → Short Break → Work → ... → Long Break
- Quick start presets (5min, 10min, 25min)
- Active item tracking (what you're focusing on)
- Switch focus dialog when changing items mid-session
- Session persistence (survives page refresh)

**Key Components**:
- `pages/Focus.tsx` - Focus page with timer and controls
- `components/FocusTimer.tsx` - Timer display
- `components/FocusControls.tsx` - Play/Pause/Skip/Finish buttons
- `components/FocusDropZone.tsx` - Drag target for starting focus
- `components/SwitchFocusDialog.tsx` - Confirm switching items
- `hooks/useFocus.ts` - Focus state management with timer logic

**Database**: `focus_sessions` table, `focus_settings` table

**State Management**:
```typescript
{
  activeItemId?: string;      // ID of focused task/item
  activeItemText?: string;    // Display text
  timeRemaining: number;      // Seconds left
  isRunning: boolean;
  isPaused: boolean;
  sessionType: 'work' | 'short_break' | 'long_break';
  workSessionsCount: number;  // For long break interval
}
```

---

### 4. Quest System
**Purpose**: Achievement-based rewards system.

**Features**:
- Daily, weekly, and milestone quests
- XP and coin rewards
- Progress tracking
- Quest claiming UI
- Auto-generated quests based on user activity

**Key Components**:
- `pages/Quests.tsx` - Quest list and claiming
- `components/QuestCard.tsx` - Individual quest display
- `hooks/useQuests.ts` - Quest data management

**Database**: `quests` table, `user_quest_progress` table

**Quest Types**:
- **Daily**: Reset every 24 hours (e.g., "Complete 5 tasks")
- **Weekly**: Reset every 7 days (e.g., "Focus for 10 hours")
- **Milestone**: One-time achievements (e.g., "Reach level 10")

---

### 5. Routine System
**Purpose**: Daily habit tracking with streaks.

**Features**:
- Create custom routines
- Schedule by days of week
- Streak tracking
- Completion rewards
- Visual progress indicators

**Key Components**:
- `pages/Routines.tsx` - Routine management
- `components/RoutineCard.tsx` - Individual routine display
- `hooks/useRoutines.ts` - Routine data management

**Database**: `routines` table, `routine_completions` table

---

### 6. Profile & Progression
**Purpose**: User progression and customization.

**Features**:
- XP-based leveling (100 XP per level)
- Coin economy for cosmetics
- Profile customization (avatar, banner, title)
- Stats tracking (total tasks, focus time, streaks)
- Onboarding flow

**Key Components**:
- `pages/Profile.tsx` - Profile page
- `components/ProfileCard.tsx` - Profile display
- `hooks/useProfile.ts` - Profile state management

**Database**: `profiles` table

**Leveling Formula**:
```typescript
level = Math.floor(totalXP / 100) + 1;
nextLevelXP = level * 100;
progress = (totalXP % 100) / 100;
```

---

### 7. Bazaar (Cosmetics Shop)
**Purpose**: Cosmetic item shop for customization.

**Features**:
- Browse cosmetics by category (Avatars, Banners, Titles)
- Purchase with coins
- Equip/unequip cosmetics
- Preview cosmetics before purchase

**Key Components**:
- `pages/Bazaar.tsx` - Shop page
- `components/CosmeticCard.tsx` - Item display
- `hooks/useCosmetics.ts` - Cosmetics management

**Database**: `cosmetics` table, `user_cosmetics` table

**Cosmetic Types**:
- **Avatar**: Profile picture replacement
- **Banner**: Profile header background
- **Title**: Display name suffix (e.g., "The Focused")

---

## Data Flow Architecture

### Client-Side State Management

```
React Query (Server State)
    ↓
Custom Hooks (Business Logic)
    ↓
Context Providers (Global State)
    ↓
Components (UI)
```

**React Query**: Handles all server data fetching, caching, and synchronization.

**Custom Hooks**: Encapsulate business logic and provide clean API to components.
- `useProfile()` - Profile data and mutations
- `useTasks()` - Task CRUD operations
- `useDailySpread()` - Daily spread items
- `useFocus()` - Focus timer state and controls
- `useQuests()` - Quest data and claiming
- `useRoutines()` - Routine management
- `useCosmetics()` - Cosmetics and purchasing

**Context Providers**:
- `ProfileProvider` - Global profile state
- `FocusProvider` - Focus session state (persisted to localStorage)
- `SidebarContext` - Sidebar collapse state

### Server-Side Architecture

```
Express Router
    ↓
Route Handler
    ↓
Database Query (Drizzle ORM)
    ↓
Response JSON
```

**Route Organization**:
- `/api/profile` - Profile endpoints
- `/api/tasks` - Task endpoints
- `/api/daily-spread` - Daily spread endpoints
- `/api/focus` - Focus session endpoints
- `/api/quests` - Quest endpoints
- `/api/routines` - Routine endpoints
- `/api/cosmetics` - Cosmetics endpoints

**Database Layer** (Drizzle ORM):
```typescript
// Schema definition
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  quadrant: text('quadrant').notNull(),
  // ...
});

// Query example
const userTasks = await db
  .select()
  .from(tasks)
  .where(eq(tasks.userId, userId));
```

---

## Database Schema

### Core Tables

**profiles**
```sql
- id (serial, PK)
- username (text, unique)
- nickname (text)
- level (integer, default 1)
- experience (integer, default 0)
- coins (integer, default 0)
- equipped_avatar (text)
- equipped_banner (text)
- equipped_title (text)
- has_completed_onboarding (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

**tasks**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- title (text)
- description (text)
- quadrant (text: 'urgent-important', 'not-urgent-important', etc.)
- matrix_type (text: 'personal', 'work')
- completed (boolean, default false)
- completed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

**daily_spread_items**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- text (text)
- type (text: 'task', 'event', 'note')
- bucket (text: 'today', 'tomorrow', 'someday')
- time (text, optional)
- order_index (integer)
- completed (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

**focus_sessions**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- item_id (text, optional)
- item_text (text, optional)
- session_type (text: 'work', 'short_break', 'long_break')
- duration_seconds (integer)
- started_at (timestamp)
- ended_at (timestamp)
- completed (boolean)
```

**focus_settings**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- work_duration (integer, default 1500) // 25 minutes
- short_break_duration (integer, default 300) // 5 minutes
- long_break_duration (integer, default 900) // 15 minutes
- long_break_interval (integer, default 4) // every 4 work sessions
```

**quests**
```sql
- id (serial, PK)
- title (text)
- description (text)
- type (text: 'daily', 'weekly', 'milestone')
- requirement_type (text: 'tasks_completed', 'focus_time', etc.)
- requirement_count (integer)
- xp_reward (integer)
- coin_reward (integer)
```

**user_quest_progress**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- quest_id (integer, FK -> quests.id)
- progress (integer)
- completed (boolean)
- claimed (boolean)
- completed_at (timestamp)
```

**routines**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- title (text)
- description (text)
- days_of_week (jsonb) // [0,1,2,3,4,5,6]
- time (text, optional)
- streak (integer, default 0)
- created_at (timestamp)
```

**routine_completions**
```sql
- id (serial, PK)
- routine_id (integer, FK -> routines.id)
- completed_at (timestamp)
```

**cosmetics**
```sql
- id (serial, PK)
- name (text)
- description (text)
- type (text: 'avatar', 'banner', 'title')
- rarity (text: 'common', 'rare', 'epic', 'legendary')
- price (integer)
- image_url (text, optional)
```

**user_cosmetics**
```sql
- id (serial, PK)
- user_id (integer, FK -> profiles.id)
- cosmetic_id (integer, FK -> cosmetics.id)
- purchased_at (timestamp)
```

---

## UI/UX Patterns

### Layout Structure

```
┌─────────────────────────────────────────────┐
│ TopBar (fixed, 64px height)                 │
│ - Hamburger menu, Coins, Profile            │
├──────────┬──────────────────────────────────┤
│ Nav      │ Main Content                     │
│ Drawer   │ (scrollable)                     │
│ (256px)  │                                  │
│          │                                  │
│ or       │                                  │
│          │                                  │
│ (80px)   │                                  │
│ collapsed│                                  │
└──────────┴──────────────────────────────────┘
```

### Navigation Drawer States

**Expanded (256px)**:
- Full logo + text
- Nav items with icons + labels + descriptions
- Full profile card with avatar, name, level

**Collapsed (80px)**:
- Logo icon only
- Nav items with icons only (+ tooltips)
- Avatar with level badge (no container)

### Button Design System

**3D Glass Effect** (`.btn-glass`):
- Used for primary and destructive actions
- 8px shadow with gradient (color matches button)
- Hover: lifts up 2px
- Active: pressed down effect

**Chunky Effect** (`.btn-chunky`):
- Used for outline and secondary actions
- 3px solid shadow (semi-transparent black)
- Subtle depth without overpowering

### Animation Patterns

**Page Transitions**: None (instant navigation for performance)

**Item Animations**:
- Drag & Drop: Real-time position updates
- Completion: Scale + fade out
- Addition: Fade in from top

**Focus Timer**:
- Circular progress indicator
- Smooth countdown animation (1s intervals)
- Color changes based on session type

---

## Performance Optimizations

### Client-Side
- React Query caching (5 minute stale time for most queries)
- Lazy loading for heavy components
- Virtual scrolling for long lists (not yet implemented)
- Debounced input handlers (300ms)
- Memoized computed values with `useMemo`

### Server-Side
- Database connection pooling
- Indexed queries on user_id and frequently filtered columns
- Batch operations where possible
- JSON response compression

### Build Optimizations
- Vite code splitting
- Tree shaking for unused imports
- Minified production builds
- Asset optimization (images, fonts)

---

## Security Considerations

### Current Implementation
- User authentication via session (stored in database)
- User ID-based data isolation (all queries filtered by userId)
- Input validation on client and server
- SQL injection prevention via Drizzle ORM parameterized queries

### Future Enhancements
- JWT-based authentication
- Rate limiting on API endpoints
- CSRF protection
- XSS prevention (React handles this mostly)
- Environment variable validation

---

## Testing Strategy

### Current Status
- Manual testing for all features
- No automated tests yet

### Planned Testing
- **Unit Tests**: Utility functions, hooks
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows (task creation, focus session, quest claiming)
- **Visual Regression**: Component snapshots

---

## Deployment Pipeline

```
Local Development
    ↓ git push
GitHub Repository
    ↓ webhook
Vercel Build
    ↓ success
Vercel Deployment (Production)
    ↓
Neon PostgreSQL (Production DB)
```

**Environment Variables** (Vercel):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV=production`

**Build Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install"
}
```
