# Howerful Documentation

Welcome to the Howerful documentation! This directory contains comprehensive information about the project.

## 📚 Documentation Files

### [ARCHITECTURE.md](ARCHITECTURE.md)
Complete system architecture, database schema, and technical design patterns.

**Read this for**:
- Understanding how the app works
- Database schema reference
- API endpoint specifications
- Component architecture
- UI/UX patterns and design system

### [CHANGELOG.md](CHANGELOG.md)
Complete development history with all features, fixes, and changes.

**Read this for**:
- Historical context
- Feature implementation details
- Bug fix history
- Design decision rationale

## 🚀 Quick Start for AI Assistants

Start with [`../PLAN.md`](../PLAN.md) - it contains:
- AI Quick Start guide (system overview)
- Current sprint priorities
- Recently completed features
- Known blockers and technical debt
- API endpoints quick reference

Then reference:
1. **ARCHITECTURE.md** for technical details
2. **CHANGELOG.md** for historical context

---

## Project Overview

**Howerful** is a gamified productivity app combining:
- **Dojo**: Brain dump and task triage (bullet journal style)
- **Matrix**: Eisenhower Matrix for task prioritization
- **Focus**: Pomodoro-style focus sessions with time tracking
- **Quests**: Achievement system with XP and coin rewards
- **Routines**: Daily habit tracking with streaks
- **Bazaar**: Cosmetics shop for profile customization

### Tech Stack
- React + TypeScript + Vite
- Express.js + PostgreSQL
- Tailwind CSS + shadcn/ui
- Framer Motion + dnd-kit

### Key Features
- XP-based leveling system
- Drag & drop task management
- Natural language task parsing
- Focus session tracking with breaks
- Customizable profile cosmetics
- Collapsible navigation sidebar

---

## File Structure

```
howerful/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and config
│   │   └── App.tsx        # Main app component
│   └── index.html
│
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── ...
│
├── db/                    # Database
│   ├── schema.ts         # Drizzle schema definitions
│   └── index.ts          # Database connection
│
├── shared/               # Shared types
│   └── schema.ts        # Shared TypeScript types
│
├── docs/                # Documentation
│   ├── README.md        # This file
│   ├── ARCHITECTURE.md  # System architecture
│   └── CHANGELOG.md     # Development history
│
└── PLAN.md             # Current development plan
```

---

## Development Workflow

### Local Development
```bash
npm run dev    # Start both client and server
```

### Deployment
- **Platform**: Vercel (auto-deploys on push to main)
- **Database**: Neon PostgreSQL
- **Workflow**: Local testing → Commit → Push → Auto-deploy

### Key Commands
```bash
npm run dev          # Start dev servers
npm run build        # Build for production
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
```

---

## Contributing Guidelines

When working on Howerful:

1. **Test locally first** - Always verify changes work before deploying
2. **Commit frequently** - Small, focused commits with clear messages
3. **Update PLAN.md** - Keep current priorities and completed features up to date
4. **Document decisions** - Add significant changes to CHANGELOG.md
5. **Follow patterns** - Refer to ARCHITECTURE.md for established patterns

---

## Need Help?

- **Technical details**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Historical context**: See [CHANGELOG.md](CHANGELOG.md)
- **Current work**: See [`../PLAN.md`](../PLAN.md)
- **Code issues**: Check the codebase directly
