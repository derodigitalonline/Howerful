# Howerful - Gamified Task Tracking App

## About User
User is an experienced senior level designer with minimal coding knowledge. You can talk to him like a moron and offer syntax, structure, or other coding explanations where deemed necessary.

## Overview
Howerful is a gamified bullet journal app with XP, levels, quests, and a 3D companion character named "Howie". Built with React, TypeScript, Vite, and Supabase.

## Common Commands
- `npm run dev` - Start Vite dev server (usually runs on http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure
- `/client` - Frontend React app
  - `/client/src/pages` - Page components (Dojo, Profile, Quests, Routines, Focus, etc.)
  - `/client/src/components` - Reusable UI components
  - `/client/src/hooks` - Custom React hooks
- `/shared` - Shared TypeScript types and schemas
- `/docs` - Documentation (PRIMER.md, CHANGELOG.md)

## Key Features
- **Dojo (Task Journal)**: Bullet journal with Today/Tomorrow/Someday buckets, masonry grid layout
- **Focus Sessions**: Pomodoro-style timer with 3D Howie companion
- **Quests**: Daily quests, story quests for progression
- **Routines**: Daily routine tracking
- **XP System**: RuneScape-inspired exponential leveling (max level 50)
- **Howie**: 3D customizable character using Three.js/React Three Fiber

## Code Style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Use TypeScript for all new files
- Prefer functional components with hooks over class components
- Use Tailwind CSS for styling - avoid inline styles
- Component file naming: PascalCase (e.g., `TaskInput.tsx`)
- Use the existing design system colors from `index.css` and `tailwind.config.ts`
- IMPORTANT: NEVER use emojis in code unless explicitly requested by the user

## Layout Standards
- **Max width for main content**: 1250px (`max-w-[1250px]`)
- **Padding**: `px-6 md:px-8` (24px mobile, 32px desktop)
- **Masonry grid**: 3 columns desktop, 2 columns tablet, 1 column mobile

## Database
- Uses Supabase for authentication and data persistence
- Environment variables in `client/.env.local` (not committed to git)
- Fallback to localStorage when not authenticated

## Important Notes
- Target audience for Howerful is ADHD, AuDHD, and neurodivergent "work-from-home" users, ages 16-39, that struggle day to day with feeling good about how they track tasks and feeling rewarded for doing so.

## Workflow
- Always check that dev server compiles without errors before finishing
- Test responsive design on mobile breakpoints when making layout changes
- Use the existing component patterns (check similar components before creating new ones)

## Database
- Using Supabase