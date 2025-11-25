import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { FocusSettings, FocusSession } from '@shared/schema';

/**
 * FOCUS SETTINGS
 */

// Helper: Convert database row to FocusSettings type
function dbRowToFocusSettings(row: any): FocusSettings {
  return {
    workDuration: row.work_duration,
    shortBreakDuration: row.short_break_duration,
    longBreakDuration: row.long_break_duration,
    longBreakInterval: row.long_break_interval,
    autoStartBreaks: row.auto_start_breaks,
    autoStartWork: row.auto_start_work,
    soundEnabled: row.sound_enabled,
    notificationsEnabled: row.notifications_enabled,
  };
}

// Helper: Convert FocusSettings type to database row
function focusSettingsToDbRow(settings: FocusSettings, userId: string) {
  return {
    user_id: userId,
    work_duration: settings.workDuration,
    short_break_duration: settings.shortBreakDuration,
    long_break_duration: settings.longBreakDuration,
    long_break_interval: settings.longBreakInterval,
    auto_start_breaks: settings.autoStartBreaks,
    auto_start_work: settings.autoStartWork,
    sound_enabled: settings.soundEnabled,
    notifications_enabled: settings.notificationsEnabled,
  };
}

/**
 * Fetch focus settings from Supabase
 */
export function useSupabaseFocusSettings() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['focusSettings', user?.id],
    queryFn: async (): Promise<FocusSettings | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('focus_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Settings might not exist yet, return null
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching focus settings:', error);
        throw error;
      }

      return data ? dbRowToFocusSettings(data) : null;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Upsert (create or update) focus settings
 */
export function useUpsertFocusSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: FocusSettings): Promise<FocusSettings> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const dbRow = focusSettingsToDbRow(settings, user.id);

      const { data, error } = await supabase
        .from('focus_settings')
        .upsert(dbRow, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error upserting focus settings:', error);
        throw error;
      }

      return dbRowToFocusSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusSettings', user?.id] });
    },
  });
}

/**
 * FOCUS SESSIONS
 */

// Helper: Convert database row to FocusSession type
function dbRowToFocusSession(row: any): FocusSession {
  return {
    id: row.id,
    itemId: row.item_id || undefined,
    itemText: row.item_text || undefined,
    phase: row.phase,
    targetDuration: row.target_duration,
    actualDuration: row.actual_duration || undefined,
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    wasInterrupted: row.was_interrupted,
    wasCompleted: row.was_completed,
  };
}

// Helper: Convert FocusSession type to database row
function focusSessionToDbRow(session: FocusSession, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    item_id: session.itemId || null,
    item_text: session.itemText || null,
    phase: session.phase,
    target_duration: session.targetDuration,
    actual_duration: session.actualDuration || null,
    started_at: session.startedAt,
    completed_at: session.completedAt || null,
    was_interrupted: session.wasInterrupted,
    was_completed: session.wasCompleted,
  };
}

/**
 * Fetch all focus sessions from Supabase
 */
export function useSupabaseFocusSessions() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['focusSessions', user?.id],
    queryFn: async (): Promise<FocusSession[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching focus sessions:', error);
        throw error;
      }

      return data ? data.map(dbRowToFocusSession) : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Add a new focus session to Supabase
 */
export function useAddFocusSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: FocusSession): Promise<FocusSession> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const dbRow = focusSessionToDbRow(session, user.id);

      const { data, error } = await supabase
        .from('focus_sessions')
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error('Error adding focus session:', error);
        throw error;
      }

      return dbRowToFocusSession(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusSessions', user?.id] });
    },
  });
}

/**
 * ROUTINES
 */

interface DailyRoutine {
  id: string;
  text: string;
  completed: boolean;
}

interface RoutineMetadata {
  lastClaimedDate: string | null;
  lastResetDate: string | null;
  xpAwardedToday: string[];
}

// Helper: Convert database row to DailyRoutine type
function dbRowToRoutine(row: any): DailyRoutine {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
  };
}

// Helper: Convert DailyRoutine type to database row
function routineToDbRow(routine: DailyRoutine, userId: string) {
  return {
    id: routine.id,
    user_id: userId,
    text: routine.text,
    completed: routine.completed,
  };
}

/**
 * Fetch all routines from Supabase
 */
export function useSupabaseRoutines() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['routines', user?.id],
    queryFn: async (): Promise<DailyRoutine[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching routines:', error);
        throw error;
      }

      return data ? data.map(dbRowToRoutine) : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Fetch routine metadata from Supabase
 */
export function useSupabaseRoutineMetadata() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['routineMetadata', user?.id],
    queryFn: async (): Promise<RoutineMetadata | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('routine_metadata')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Metadata might not exist yet, return null
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching routine metadata:', error);
        throw error;
      }

      return data ? {
        lastClaimedDate: data.last_claimed_date,
        lastResetDate: data.last_reset_date,
        xpAwardedToday: data.xp_awarded_today || [],
      } : null;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Upsert routine metadata
 */
export function useUpsertRoutineMetadata() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: RoutineMetadata): Promise<RoutineMetadata> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const dbRow = {
        user_id: user.id,
        last_claimed_date: metadata.lastClaimedDate,
        last_reset_date: metadata.lastResetDate,
        xp_awarded_today: metadata.xpAwardedToday,
      };

      const { data, error } = await supabase
        .from('routine_metadata')
        .upsert(dbRow, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error upserting routine metadata:', error);
        throw error;
      }

      return {
        lastClaimedDate: data.last_claimed_date,
        lastResetDate: data.last_reset_date,
        xpAwardedToday: data.xp_awarded_today || [],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routineMetadata', user?.id] });
    },
  });
}

/**
 * Bulk upsert routines (for setup/edit)
 */
export function useBulkUpsertRoutines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routines: DailyRoutine[]): Promise<DailyRoutine[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      // First, delete all existing routines for this user
      const { error: deleteError } = await supabase
        .from('routines')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting old routines:', error);
        throw deleteError;
      }

      // Then insert new routines
      const dbRows = routines.map(r => routineToDbRow(r, user.id));

      const { data, error } = await supabase
        .from('routines')
        .insert(dbRows)
        .select();

      if (error) {
        console.error('Error bulk upserting routines:', error);
        throw error;
      }

      return data ? data.map(dbRowToRoutine) : [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', user?.id] });
    },
  });
}

/**
 * Update a single routine's completion status
 */
export function useUpdateRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('routines')
        .update({ completed })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating routine:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', user?.id] });
    },
  });
}

// Export types for use in other files
export type { DailyRoutine, RoutineMetadata };
