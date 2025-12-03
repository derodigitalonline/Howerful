# Setup Guide

Complete guide for setting up Howerful's development environment and Supabase backend.

---

## Prerequisites

- **Node.js** 18+ ([download here](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Supabase account** ([sign up here](https://supabase.com))
- Basic understanding of SQL (migration files are provided)

---

## Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd Howerful

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev

# Server runs at http://localhost:5175
```

---

## Detailed Setup

### 1. Supabase Project Setup

#### Create Project (5 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: `Howerful` (or your preferred name)
   - **Database Password**: Choose a strong password (**save this!**)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier works great to start
5. Click **"Create new project"** and wait 1-2 minutes for initialization

#### Get API Credentials (2 minutes)

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJhb...`)

---

### 2. Environment Variables

#### Create .env.local

```bash
# Copy the example file
cp .env.example .env.local
```

#### Edit .env.local

Paste your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important Notes:**
- Environment variables MUST start with `VITE_` prefix (Vite requirement)
- Never commit `.env.local` to git (already in `.gitignore`)
- **Restart your dev server** after adding environment variables

---

### 3. Database Migrations

You have two options for running database migrations:

#### Option A: Supabase Dashboard (Recommended for first time)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/migrations/001_initial_schema.sql` from this repo
5. Copy the entire SQL file
6. Paste into the SQL Editor
7. Click **Run** (bottom right corner)
8. You should see "Success. No rows returned"
9. Repeat for subsequent migration files (002, 003, 004) in order

#### Option B: Supabase CLI (Advanced)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

---

### 4. Verify Database Setup

#### Check Tables

1. In Supabase dashboard, go to **Table Editor**
2. You should see these 12 tables:
   - `profiles`
   - `equipped_cosmetics`
   - `unlocked_cosmetics`
   - `bullet_items`
   - `focus_settings`
   - `focus_sessions`
   - `routines`
   - `routine_metadata`
   - `daily_quests`
   - `quest_inbox`
   - `claimed_quests`

#### Verify Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Verify RLS is enabled on all tables
3. Each table should have policies like:
   - "Users can view own profile"
   - "Users can update own profile"
   - "Users can insert own profile"

#### Check Triggers

1. Go to **Database** → **Functions**
2. Verify `handle_new_user()` function exists
3. This auto-creates a profile when users sign up

---

### 5. Authentication Configuration

#### Email Settings (Required)

Go to **Authentication** → **Settings**:

**For Development:**
- ✅ Disable **"Confirm Email"** - allows instant testing
- ✅ Disable **"Secure Email Change"** - simplifies email updates
- ✅ Enable **"Enable Email Signups"**

**For Production:**
- ✅ Enable **"Confirm Email"** - improves security
- ✅ Enable **"Secure Email Change"**
- ✅ Keep **"Enable Email Signups"** enabled

#### Email Templates (Optional)

Go to **Authentication** → **Email Templates** to customize:
- Confirmation email (user signup)
- Password reset email
- Magic link email (passwordless login)
- Email change confirmation

#### OAuth Providers (Optional)

Go to **Authentication** → **Providers** to enable social logins:

**Google OAuth:**
1. Create OAuth app in [Google Cloud Console](https://console.cloud.google.com/)
2. Add credentials to Supabase
3. Configure redirect URLs

**GitHub OAuth:**
1. Create OAuth app in [GitHub Settings](https://github.com/settings/developers)
2. Add credentials to Supabase
3. Configure callback URL

**Other Providers:**
- Discord
- Twitter
- Facebook
- Apple

---

### 6. Development Workflow

#### Start Development Server

```bash
npm run dev
```

Runs both client (Vite) and server (Express) concurrently.
- Client: `http://localhost:5175`
- Server: `http://localhost:5000`

#### Test the Connection

1. Open browser console at `http://localhost:5175`
2. You should NOT see: "Supabase credentials not found"
3. If you see the warning, verify:
   - `.env.local` exists in project root
   - Variables start with `VITE_` prefix
   - Dev server was restarted after creating `.env.local`

#### Create Test Account

1. Visit `http://localhost:5175/signup`
2. Fill in email and password
3. Click "Sign Up"
4. Check **Authentication** → **Users** in Supabase dashboard
5. Verify new user appears
6. Check **Table Editor** → **profiles** for auto-created profile row

---

## Database Commands

```bash
# Push schema changes (Drizzle ORM)
npm run db:push

# Generate migrations
npm run db:generate

# Seed database with test data
npm run db:seed
```

---

## Build & Deployment

### Production Build

```bash
# Build client and server
npm run build

# Preview production build
npm run preview
```

### Vercel Deployment

Howerful is configured for automatic Vercel deployment:

1. Push to `main` branch triggers auto-deploy
2. Environment variables configured in Vercel dashboard
3. Build command: `npm run build`
4. Output directory: `dist/public`

**Required Vercel Environment Variables:**
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Troubleshooting

### "Supabase credentials not found" warning

**Symptoms:** Warning in browser console, auth not working

**Solutions:**
- Check that `.env.local` exists in project root (not in `/client`)
- Verify environment variables start with `VITE_` prefix
- Restart dev server: Stop with `Ctrl+C`, run `npm run dev` again
- Check `.env.local` is not ignored by git (should be in `.gitignore`)

---

### SQL Migration Errors

**Symptoms:** "Error executing SQL" in Supabase dashboard

**Solutions:**
- Ensure you're using PostgreSQL 15+ (Supabase default)
- Run migrations in order: 001, then 002, then 003, then 004
- Check SQL Editor console for specific error messages
- Verify you copied the entire SQL file (no truncation)
- Check for syntax errors if you modified the SQL

---

### Authentication Not Working

**Symptoms:** Can't sign up or login, auth errors in console

**Solutions:**
- Verify email confirmation is disabled for testing:
  - Go to **Auth** → **Settings**
  - Toggle off **"Confirm Email"**
- Check browser console for specific error messages
- Verify RLS policies are correctly set up:
  - Go to **Auth** → **Policies**
  - Each table should have view/update/insert policies
- Test with Supabase dashboard:
  - Go to **Auth** → **Users**
  - Try creating user manually to test database

---

### Can't See User Data

**Symptoms:** Data not appearing, permission errors

**Solutions:**
- Check Row Level Security is enabled:
  - Go to **Table Editor**
  - Each table should show RLS badge
- Verify you're logged in:
  - Check `supabase.auth.getUser()` in console
  - Should return user object, not null
- Check browser console for permission errors
- Verify foreign keys are correct:
  - `user_id` columns should reference `profiles.id`

---

### Dev Server Won't Start

**Symptoms:** Port already in use, npm errors

**Solutions:**
- Kill existing processes on ports 5175 and 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5175
  taskkill /PID <PID> /F

  # Mac/Linux
  lsof -ti:5175 | xargs kill -9
  ```
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check Node.js version: `node --version` (should be 18+)

---

### Database Connection Issues

**Symptoms:** Can't connect to Supabase, timeout errors

**Solutions:**
- Verify Supabase project is active (not paused)
- Check Project URL is correct in `.env.local`
- Test connection in Supabase dashboard:
  - Go to **SQL Editor**
  - Run: `SELECT NOW();`
  - Should return current timestamp
- Check network/firewall settings
- Verify API keys haven't been rotated

---

## Security Best Practices

### Environment Variables
- ✅ **Never commit `.env.local`** (already in `.gitignore`)
- ✅ **Use anon key in frontend** (service key is backend-only)
- ✅ **Rotate keys if exposed** (can regenerate in Supabase dashboard)

### Row Level Security
- ✅ **Enable RLS on all tables** (prevents unauthorized access)
- ✅ **Test policies** (try accessing data from different accounts)
- ✅ **Use auth.uid()** in policies (identifies current user)

### User Data
- ✅ **Users can only access their own data** (enforced by RLS)
- ✅ **Foreign keys reference auth.users** (automatic cleanup on delete)
- ✅ **Sensitive fields encrypted** (Supabase handles this)

### Dependencies
- ✅ **Regularly update dependencies**:
  ```bash
  npm update @supabase/supabase-js
  npm audit fix
  ```
- ✅ **Review security advisories** (GitHub Dependabot)
- ✅ **Pin versions in production** (use package-lock.json)

---

## Next Steps

After setup is complete:

1. ✅ Create a user account through the app
2. ✅ Test creating bullet items, tasks, routines
3. ✅ Verify data persists in Supabase Table Editor
4. ✅ Test focus timer and quest system
5. ✅ Customize your Howie with cosmetics

---

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Dashboard](https://app.supabase.com)

---

## Support

If you encounter issues:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review Supabase project logs (**Dashboard** → **Logs**)
3. Search [Supabase Discussions](https://github.com/supabase/supabase/discussions)
4. Ask in [Supabase Discord](https://discord.supabase.com)

---

For API reference and database schema details, see [API_REFERENCE.md](API_REFERENCE.md).
