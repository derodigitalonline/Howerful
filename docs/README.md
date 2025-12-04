# Howerful Documentation

Welcome to Howerful's documentation hub! Everything you need to understand, set up, and contribute to the project.

---

## Quick Links

### Onboarding
- **[Quick Primer](PRIMER.md)** - Start here! Compact overview of the entire codebase
- **[API Reference](API_REFERENCE.md)** - Complete reference for endpoints, hooks, and schemas
- **[Current Sprint](../PLAN.md)** - Latest priorities and recent completions (root level)

### For Developers
- **[Setup Guide](SETUP.md)** - Installation and Supabase configuration
- **[Architecture](ARCHITECTURE.md)** - System design and technical patterns
- **[Design System](DESIGN_SYSTEM.md)** - UI/UX patterns and component guidelines
- **[Changelog](CHANGELOG.md)** - Complete development history

---

## Documentation Guide

### Start Here

**New to the project?** Read in this order:
1. [PRIMER.md](PRIMER.md) - 10-minute overview of everything
2. [SETUP.md](SETUP.md) - Get the environment running
3. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the system design

**Need API details?** Go straight to [API_REFERENCE.md](API_REFERENCE.md)

**Want to contribute to the UI?** UI for Howerful is a work in progress. I've established chunky buttons and animation to help push the app towards a gamified feel, but any and all feedback or changes are welcome. Check [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

---

## What's in Each Document

### [PRIMER.md](PRIMER.md)
**Quick Reference (200-300 lines)**

Optimized for rapid context loading if you use agents / LLM:
- Project overview and tech stack
- Core systems summary (Dojo, Focus, Quests, etc.)
- Key hooks and their purposes
- Database tables overview
- Important patterns and gotchas
- File locations and commands

---

### [SETUP.md](SETUP.md)
**Installation & Configuration Guide**

Complete setup instructions:
- Prerequisites and dependencies
- Supabase project creation
- Environment variables
- Database migrations
- Authentication configuration
- Troubleshooting guide

---

### [API_REFERENCE.md](API_REFERENCE.md)
**Complete API Documentation**

Comprehensive reference for:
- REST API endpoints
- Custom React hooks (detailed signatures)
- Database schema (all 12 tables)
- TypeScript interfaces
- Data relationships
- Migration history

---

### [ARCHITECTURE.md](ARCHITECTURE.md)
**System Design & Technical Patterns**

Deep dive into:
- Core systems (7 detailed sections)
- Data flow architecture
- UI/UX patterns
- Performance optimizations
- Security considerations
- Deployment pipeline

---

### [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
**UI/UX Patterns & Guidelines**

Design specifications:
- Color palette and themes
- Typography system
- Component library
- Button variants and effects
- Layout patterns
- Responsive behavior

---

### [CHANGELOG.md](CHANGELOG.md)
**Development History**

Historical record:
- Feature implementations
- Bug fixes
- Design decisions
- Refactoring notes
- Migration details

---

### [PLAN.md](../PLAN.md)
**Current Sprint & Priorities** *(in root directory)*

Living document:
- Recently completed features
- Next priorities
- Known blockers
- Technical debt
- Quick commands

---

## Project Overview

**Howerful** is a gamified productivity app combining bullet journaling, focus sessions, habit tracking, and RPG-style progression.

### Core Features
- **Dojo**: Temporal bucket system for task management (Today/Tomorrow/Someday/Future-Log)
- **Focus Mode**: Pomodoro timer with session tracking
- **Quest System**: Daily challenges with XP/coin rewards
- **Routines**: Habit tracking with streaks
- **Profile & Cosmetics**: 3D avatar customization with unlockable items

### Tech Stack
- **Frontend:** React 18, TypeScript, TailwindCSS, shadcn/ui, Three.js
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **State:** React Query, Context API
- **Build:** Vite

---

## File Structure

```
howerful/
├── client/                      # React frontend
│   ├── src/
│   │   ├── pages/              # Route components
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom hooks (business logic)
│   │   ├── contexts/           # React Context providers
│   │   ├── constants/          # Static data (cosmetics)
│   │   └── lib/                # Utilities (supabase, utils)
│   └── public/
│       ├── models/             # 3D assets (.glb files)
│       └── assets/             # Images, cosmetics PNGs
│
├── server/                      # Express backend (optional)
│   └── index.ts
│
├── shared/                      # Shared types
│   └── schema.ts               # Zod schemas
│
├── supabase/                    # Database
│   ├── migrations/             # Version-controlled schema
│   └── README.md               # Module-level docs
│
├── docs/                        # Documentation (you are here!)
│   ├── README.md               # This file
│   ├── PRIMER.md               # Quick reference
│   ├── SETUP.md                # Setup guide
│   ├── API_REFERENCE.md        # API docs
│   ├── ARCHITECTURE.md         # System design
│   ├── DESIGN_SYSTEM.md        # UI/UX patterns
│   └── CHANGELOG.md            # Development history
│
├── archive/                     # Historical documents
│   ├── README.md
│   ├── PHASE_5_COMPLETE.md
│   ├── SUPABASE_SETUP.md
│   └── cosmetics_3d_plan.md
│
└── PLAN.md                     # Current sprint (root level)
```

---

## Development Workflow

### Quick Start
```bash
npm install              # Install dependencies
cp .env.example .env.local  # Configure environment
npm run dev              # Start development server
```

### Common Commands
```bash
npm run dev          # Start dev server (client + server)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Git Workflow
```bash
git status                # Check changes
git add .                 # Stage all changes
git commit -m "message"   # Commit with message
git push                  # Deploy to Vercel (auto)
```

---

## Contributing Guidelines

When working on Howerful:

1. **Read PRIMER.md first** - Understand the codebase before making changes
2. **Follow established patterns** - See ARCHITECTURE.md for conventions
3. **Test locally** - Verify changes work before committing
4. **Update documentation** - Keep PLAN.md and CHANGELOG.md current
5. **Commit frequently** - Small, focused commits with clear messages

---

## Deployment

- **Platform**: Vercel (auto-deploys on push to `main`)
- **Database**: Supabase (PostgreSQL with RLS)
- **Environment**: Configure in Vercel dashboard

---

## Need Help?

Email me at john@derodigital.art or add me on Discord: @derodigital

---