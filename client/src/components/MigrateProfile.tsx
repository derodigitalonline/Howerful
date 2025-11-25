import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import type { Task, BulletItem, FocusSettings, FocusSession } from '@shared/schema';

const PROFILE_KEY = 'eisenhower-profile';
const TASKS_KEY = 'eisenhower-tasks';
const BULLET_KEY = 'howerful-bullet-journal';
const FOCUS_SETTINGS_KEY = 'howerful-focus-settings';
const FOCUS_SESSIONS_KEY = 'howerful-focus-sessions';
const ROUTINES_KEY = 'howerful-routines';

interface LocalProfile {
  nickname?: string;
  totalXP?: number;
  level?: number;
  coins?: number;
  tasksCompleted?: number;
  doFirstTasksCompleted?: number;
  hasCompletedOnboarding?: boolean;
  selectedSprite?: string;
}

interface DailyRoutine {
  id: string;
  text: string;
  completed: boolean;
}

interface RoutineData {
  routines: DailyRoutine[];
  lastClaimedDate: string | null;
  lastResetDate: string | null;
  xpAwardedToday: string[];
}

interface LocalData {
  profile: LocalProfile | null;
  tasks: Task[];
  bulletItems: BulletItem[];
  focusSettings: FocusSettings | null;
  focusSessions: FocusSession[];
  routines: RoutineData | null;
}

export function MigrateProfile() {
  const { user, isAuthenticated } = useAuth();
  const [localData, setLocalData] = useState<LocalData>({
    profile: null,
    tasks: [],
    bulletItems: [],
    focusSettings: null,
    focusSessions: [],
    routines: null
  });
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyMigrated, setAlreadyMigrated] = useState(false);

  useEffect(() => {
    // Check if localStorage has data
    const data: LocalData = {
      profile: null,
      tasks: [],
      bulletItems: [],
      focusSettings: null,
      focusSessions: [],
      routines: null
    };

    // Load profile
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed.totalXP > 0 || parsed.tasksCompleted > 0 || parsed.hasCompletedOnboarding) {
          data.profile = parsed;
        }
      } catch (e) {
        console.error('Failed to parse localStorage profile', e);
      }
    }

    // Load tasks
    const storedTasks = localStorage.getItem(TASKS_KEY);
    if (storedTasks) {
      try {
        data.tasks = JSON.parse(storedTasks);
      } catch (e) {
        console.error('Failed to parse localStorage tasks', e);
      }
    }

    // Load bullet items
    const storedBulletItems = localStorage.getItem(BULLET_KEY);
    if (storedBulletItems) {
      try {
        data.bulletItems = JSON.parse(storedBulletItems);
      } catch (e) {
        console.error('Failed to parse localStorage bullet items', e);
      }
    }

    // Load focus settings
    const storedFocusSettings = localStorage.getItem(FOCUS_SETTINGS_KEY);
    if (storedFocusSettings) {
      try {
        data.focusSettings = JSON.parse(storedFocusSettings);
      } catch (e) {
        console.error('Failed to parse localStorage focus settings', e);
      }
    }

    // Load focus sessions
    const storedFocusSessions = localStorage.getItem(FOCUS_SESSIONS_KEY);
    if (storedFocusSessions) {
      try {
        data.focusSessions = JSON.parse(storedFocusSessions);
      } catch (e) {
        console.error('Failed to parse localStorage focus sessions', e);
      }
    }

    // Load routines
    const storedRoutines = localStorage.getItem(ROUTINES_KEY);
    if (storedRoutines) {
      try {
        data.routines = JSON.parse(storedRoutines);
      } catch (e) {
        console.error('Failed to parse localStorage routines', e);
      }
    }

    setLocalData(data);

    // Check if already migrated
    const migrated = localStorage.getItem('data-migrated');
    if (migrated === 'true') {
      setAlreadyMigrated(true);
    }
  }, []);

  const handleMigration = async () => {
    if (!localData.profile || !user || !isSupabaseConfigured()) {
      return;
    }

    setMigrating(true);
    setError(null);

    try {
      // 1. Update Supabase profile with localStorage data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nickname: localData.profile.nickname || 'Howie',
          total_xp: localData.profile.totalXP || 0,
          level: localData.profile.level || 1,
          coins: localData.profile.coins || 0,
          tasks_completed: localData.profile.tasksCompleted || 0,
          do_first_tasks_completed: localData.profile.doFirstTasksCompleted || 0,
          has_completed_onboarding: localData.profile.hasCompletedOnboarding || false,
          selected_sprite: localData.profile.selectedSprite || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Migrate tasks
      if (localData.tasks.length > 0) {
        const tasksToInsert = localData.tasks.map(task => ({
          id: task.id,
          user_id: user.id,
          text: task.text,
          quadrant: task.quadrant || null,
          workspace: task.workspace || 'personal',
          created_at: task.createdAt,
          completed: task.completed,
          completed_in_quadrant: task.completedInQuadrant || null,
        }));

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert);

        if (tasksError) throw tasksError;
      }

      // 3. Migrate bullet items
      if (localData.bulletItems.length > 0) {
        const bulletItemsToInsert = localData.bulletItems.map(item => ({
          id: item.id,
          user_id: user.id,
          type: item.type,
          text: item.text,
          bucket: item.bucket,
          date: item.date || null,
          time: item.time || null,
          completed: item.completed,
          created_at: item.createdAt,
          order_index: item.order,
          moved_to_someday_at: item.movedToSomedayAt || null,
          focus_state: item.focusState || 'idle',
          focus_started_at: item.focusStartedAt || null,
          focus_completed_at: item.focusCompletedAt || null,
          pomodoros_completed: item.pomodorosCompleted || 0,
          estimated_pomodoros: item.estimatedPomodoros || null,
        }));

        const { error: bulletItemsError } = await supabase
          .from('bullet_items')
          .insert(bulletItemsToInsert);

        if (bulletItemsError) throw bulletItemsError;
      }

      // 4. Migrate focus settings
      if (localData.focusSettings) {
        const { error: focusSettingsError } = await supabase
          .from('focus_settings')
          .upsert({
            user_id: user.id,
            work_duration: localData.focusSettings.workDuration,
            short_break_duration: localData.focusSettings.shortBreakDuration,
            long_break_duration: localData.focusSettings.longBreakDuration,
            long_break_interval: localData.focusSettings.longBreakInterval,
            auto_start_breaks: localData.focusSettings.autoStartBreaks,
            auto_start_work: localData.focusSettings.autoStartWork,
            sound_enabled: localData.focusSettings.soundEnabled,
            notifications_enabled: localData.focusSettings.notificationsEnabled,
          }, { onConflict: 'user_id' });

        if (focusSettingsError) throw focusSettingsError;
      }

      // 5. Migrate focus sessions
      if (localData.focusSessions.length > 0) {
        const focusSessionsToInsert = localData.focusSessions.map(session => ({
          id: session.id,
          user_id: user.id,
          item_id: session.itemId || null,
          item_text: session.itemText || null,
          phase: session.phase,
          target_duration: session.targetDuration,
          actual_duration: session.actualDuration || null,
          started_at: session.startedAt,
          completed_at: session.completedAt || null,
          was_interrupted: session.wasInterrupted,
          was_completed: session.wasCompleted,
        }));

        const { error: focusSessionsError } = await supabase
          .from('focus_sessions')
          .insert(focusSessionsToInsert);

        if (focusSessionsError) throw focusSessionsError;
      }

      // 6. Migrate routines
      if (localData.routines && localData.routines.routines.length > 0) {
        const routinesToInsert = localData.routines.routines.map(routine => ({
          id: routine.id,
          user_id: user.id,
          text: routine.text,
          completed: routine.completed,
        }));

        const { error: routinesError } = await supabase
          .from('routines')
          .insert(routinesToInsert);

        if (routinesError) throw routinesError;

        // 7. Migrate routine metadata
        const { error: routineMetadataError } = await supabase
          .from('routine_metadata')
          .upsert({
            user_id: user.id,
            last_claimed_date: localData.routines.lastClaimedDate,
            last_reset_date: localData.routines.lastResetDate,
            xp_awarded_today: localData.routines.xpAwardedToday,
          }, { onConflict: 'user_id' });

        if (routineMetadataError) throw routineMetadataError;
      }

      // Mark as migrated
      localStorage.setItem('data-migrated', 'true');
      setSuccess(true);
      setAlreadyMigrated(true);

      // Refresh page to load new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message || 'Failed to migrate data');
    } finally {
      setMigrating(false);
    }
  };

  // Don't show if:
  // - Not logged in
  // - No local data
  // - Already migrated
  // - Supabase not configured
  const hasData = localData.profile ||
                  localData.tasks.length > 0 ||
                  localData.bulletItems.length > 0 ||
                  localData.focusSettings ||
                  localData.focusSessions.length > 0 ||
                  (localData.routines && localData.routines.routines.length > 0);
  if (!isAuthenticated || !hasData || alreadyMigrated || !isSupabaseConfigured()) {
    return null;
  }

  return (
    <Card className="p-6 mb-6 border-blue-500/50 bg-blue-500/10">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Upload className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Import Existing Progress</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We found existing data on this device. Would you like to import it into your account?
          </p>

          <div className="bg-background/50 rounded-md p-3 mb-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Level:</span>{' '}
                <span className="font-semibold">{localData.profile?.level || 1}</span>
              </div>
              <div>
                <span className="text-muted-foreground">XP:</span>{' '}
                <span className="font-semibold">{localData.profile?.totalXP || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Matrix Tasks:</span>{' '}
                <span className="font-semibold">{localData.tasks.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bullet Items:</span>{' '}
                <span className="font-semibold">{localData.bulletItems.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Focus Sessions:</span>{' '}
                <span className="font-semibold">{localData.focusSessions.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Routines:</span>{' '}
                <span className="font-semibold">{localData.routines?.routines.length || 0}</span>
              </div>
            </div>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-green-500 mb-4">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                Migration successful! Refreshing...
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <Button
            onClick={handleMigration}
            disabled={migrating || success}
            className="w-full"
          >
            {migrating ? 'Importing...' : 'Import Progress'}
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            This will copy your local progress to your account. Your local data will remain as a backup.
          </p>
        </div>
      </div>
    </Card>
  );
}
