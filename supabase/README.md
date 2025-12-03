# Supabase Module

This directory contains Supabase-specific files for Howerful's backend.

> **For complete setup instructions**, see [../docs/SETUP.md](../docs/SETUP.md)

## Contents

- `migrations/` - Database schema versions (run in order)
  - `001_initial_schema.sql` - Initial 12-table schema with RLS
  - `002_remove_matrix_add_tracking.sql` - Quest tracking fields
  - `003_add_future_log_scheduled_date.sql` - Future Log auto-migration
  - `004_add_user_name_rename_nickname.sql` - User name fields

## Database Tables (12 total)

**User Data:**
- `profiles` - User profile, XP, level, coins
- `equipped_cosmetics` - Currently equipped items
- `unlocked_cosmetics` - Unlocked cosmetic IDs

**Tasks & Journal:**
- `bullet_items` - Bullet journal with buckets and focus tracking

**Focus System:**
- `focus_settings` - Timer preferences
- `focus_sessions` - Session history

**Routines:**
- `routines` - Habit tracking
- `routine_metadata` - Reset state

**Quests:**
- `daily_quests` - Active quests
- `quest_inbox` - Unclaimed rewards
- `claimed_quests` - Completion history

**Complete schema:** See [../docs/API_REFERENCE.md](../docs/API_REFERENCE.md)

---

## Running Migrations

### Option A: Supabase Dashboard

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy contents of `001_initial_schema.sql`
4. Click **Run**
5. Repeat for migrations 002, 003, 004 in order

### Option B: Supabase CLI

```bash
supabase db push
```

---

## Setup Instructions

For complete step-by-step setup guide, see [../docs/SETUP.md](../docs/SETUP.md)

This includes:
- Creating Supabase project
- Getting API credentials
- Configuring environment variables
- Running migrations
- Setting up authentication
- Troubleshooting

---

**Old Step-by-Step Guide Below** (deprecated - use docs/SETUP.md instead)

<details>
<summary>Click to expand legacy instructions</summary>

## Step 1: Create a Supabase Project (Legacy)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: `Howerful` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
5. Click "Create new project" and wait 1-2 minutes for setup

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJhb...`)

3. Create `.env.local` in your project root:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and paste your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Important**: Restart your dev server after adding environment variables!

## Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for first time)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/migrations/001_initial_schema.sql` from this repo
5. Copy the entire SQL file
6. Paste into the SQL Editor
7. Click **Run** (bottom right)
8. You should see "Success. No rows returned"

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 4: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `tasks`
   - `bullet_items`
   - `focus_settings`
   - `focus_sessions`
   - `routines`
   - `routine_metadata`
   - `daily_quests`
   - `quest_inbox`
   - `claimed_quests`
   - `equipped_cosmetics`
   - `unlocked_cosmetics`

3. Go to **Authentication** → **Policies**
4. Verify Row Level Security (RLS) is enabled on all tables
5. Each table should have policies like "Users can view own profile"

## Step 5: Configure Authentication Settings (Optional)

### Email Templates

Go to **Authentication** → **Email Templates** to customize:
- Confirmation email
- Password reset email
- Magic link email

### Auth Providers

Go to **Authentication** → **Providers** to enable:
- Email/Password (enabled by default)
- Google OAuth (optional)
- GitHub OAuth (optional)

For OAuth providers, you'll need to create apps in Google/GitHub and add credentials.

## Step 6: Test the Connection

1. Start your dev server: `npm run dev`
2. Open browser console
3. You should NOT see the warning: "Supabase credentials not found"
4. If you see the warning, check that:
   - `.env.local` exists and has correct values
   - Environment variable names start with `VITE_`
   - Dev server was restarted after adding `.env.local`

## Troubleshooting

### "Supabase credentials not found" warning

- Check that `.env.local` exists in project root (not in `/client`)
- Verify environment variables start with `VITE_` prefix
- Restart dev server after creating `.env.local`

### SQL migration errors

- Make sure you're using PostgreSQL 15+ (Supabase default)
- Run migrations in order (001, 002, etc.)
- Check SQL Editor for specific error messages

### Authentication not working

- Verify email confirmation is disabled for testing (Auth → Settings → "Confirm Email" toggle)
- Check browser console for error messages
- Verify RLS policies are correctly set up

### Can't see user data

- Check RLS policies are enabled
- Verify you're logged in (check `supabase.auth.getUser()`)
- Check browser console for permission errors

## Next Steps

After Supabase is configured:

1. Create a user account through the app
2. Check **Authentication** → **Users** to see the new user
3. Test creating tasks, bullet items, etc.
4. Verify data appears in **Table Editor**
5. Run the localStorage migration tool (coming in Phase 2)

## Security Best Practices

- ✅ **Never commit `.env.local`** (already in `.gitignore`)
- ✅ **Use anon key in frontend** (service key is for backend only)
- ✅ **RLS policies protect all data** (users can only access their own data)
- ✅ **Regularly update dependencies**: `npm update @supabase/supabase-js`

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://app.supabase.com)

## Support

If you encounter issues:
1. Check Supabase project logs (Dashboard → Logs)
2. Search [Supabase Discussions](https://github.com/supabase/supabase/discussions)
3. Ask in [Supabase Discord](https://discord.supabase.com)

</details>
