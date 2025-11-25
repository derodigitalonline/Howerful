import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, Quadrant, Workspace, BulletItem, BulletItemType, Bucket } from '@shared/schema';

/**
 * MATRIX TASKS (Eisenhower Matrix)
 */

// Helper: Convert database row to Task type
function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    text: row.text,
    quadrant: row.quadrant || undefined,
    workspace: row.workspace || 'personal',
    createdAt: row.created_at,
    completed: row.completed || false,
    completedInQuadrant: row.completed_in_quadrant || undefined,
  };
}

// Helper: Convert Task type to database row
function taskToDbRow(task: Partial<Task>, userId: string) {
  return {
    user_id: userId,
    text: task.text,
    quadrant: task.quadrant || null,
    workspace: task.workspace || 'personal',
    created_at: task.createdAt,
    completed: task.completed || false,
    completed_in_quadrant: task.completedInQuadrant || null,
  };
}

/**
 * Fetch all tasks from Supabase
 */
export function useSupabaseTasks() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<Task[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data ? data.map(dbRowToTask) : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Add a new task to Supabase
 */
export function useAddTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, quadrant, workspace }: { text: string; quadrant?: Quadrant; workspace?: Workspace }): Promise<Task> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const newTask: Partial<Task> = {
        id: crypto.randomUUID(),
        text,
        quadrant,
        workspace: workspace || 'personal',
        createdAt: Date.now(),
        completed: false,
      };

      const dbRow = taskToDbRow(newTask, user.id);
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...dbRow, id: newTask.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        throw error;
      }

      return dbRowToTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });
}

/**
 * Update a task in Supabase
 */
export function useUpdateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }): Promise<Task> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const dbUpdates: any = {};
      if (updates.text !== undefined) dbUpdates.text = updates.text;
      if (updates.quadrant !== undefined) dbUpdates.quadrant = updates.quadrant || null;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.completedInQuadrant !== undefined) dbUpdates.completed_in_quadrant = updates.completedInQuadrant || null;
      if (updates.workspace !== undefined) dbUpdates.workspace = updates.workspace;

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      return dbRowToTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });
}

/**
 * Delete a task from Supabase
 */
export function useDeleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });
}

/**
 * Delete all completed tasks in a workspace
 */
export function useDeleteCompletedTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspace?: Workspace): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      let query = supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('completed', true);

      if (workspace) {
        query = query.eq('workspace', workspace);
      }

      const { error } = await query;

      if (error) {
        console.error('Error deleting completed tasks:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });
}

/**
 * BULLET JOURNAL ITEMS
 */

// Helper: Convert database row to BulletItem type
function dbRowToBulletItem(row: any): BulletItem {
  return {
    id: row.id,
    type: row.type,
    text: row.text,
    bucket: row.bucket || 'today',
    date: row.date || undefined,
    time: row.time || undefined,
    completed: row.completed || false,
    createdAt: row.created_at,
    order: row.order_index,
    movedToSomedayAt: row.moved_to_someday_at || undefined,
    focusState: row.focus_state || 'idle',
    focusStartedAt: row.focus_started_at || undefined,
    focusCompletedAt: row.focus_completed_at || undefined,
    pomodorosCompleted: row.pomodoros_completed || 0,
    estimatedPomodoros: row.estimated_pomodoros || undefined,
  };
}

// Helper: Convert BulletItem type to database row
function bulletItemToDbRow(item: Partial<BulletItem>, userId: string) {
  return {
    user_id: userId,
    type: item.type,
    text: item.text,
    bucket: item.bucket || 'today',
    date: item.date || null,
    time: item.time || null,
    completed: item.completed || false,
    created_at: item.createdAt,
    order_index: item.order,
    moved_to_someday_at: item.movedToSomedayAt || null,
    focus_state: item.focusState || 'idle',
    focus_started_at: item.focusStartedAt || null,
    focus_completed_at: item.focusCompletedAt || null,
    pomodoros_completed: item.pomodorosCompleted || 0,
    estimated_pomodoros: item.estimatedPomodoros || null,
  };
}

/**
 * Fetch all bullet items from Supabase
 */
export function useSupabaseBulletItems() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['bulletItems', user?.id],
    queryFn: async (): Promise<BulletItem[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('bullet_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bullet items:', error);
        throw error;
      }

      return data ? data.map(dbRowToBulletItem) : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Add a new bullet item to Supabase
 */
export function useAddBulletItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      type,
      bucket,
      time,
      date,
      order,
    }: {
      text: string;
      type: BulletItemType;
      bucket?: Bucket;
      time?: string;
      date?: string;
      order: number;
    }): Promise<BulletItem> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const newItem: Partial<BulletItem> = {
        id: crypto.randomUUID(),
        text,
        type,
        bucket: bucket || 'today',
        time,
        date,
        completed: false,
        createdAt: Date.now(),
        order,
      };

      const dbRow = bulletItemToDbRow(newItem, user.id);
      const { data, error } = await supabase
        .from('bullet_items')
        .insert({ ...dbRow, id: newItem.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding bullet item:', error);
        throw error;
      }

      return dbRowToBulletItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletItems', user?.id] });
    },
  });
}

/**
 * Update a bullet item in Supabase
 */
export function useUpdateBulletItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BulletItem> }): Promise<BulletItem> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const dbUpdates: any = {};
      if (updates.text !== undefined) dbUpdates.text = updates.text;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.bucket !== undefined) dbUpdates.bucket = updates.bucket;
      if (updates.date !== undefined) dbUpdates.date = updates.date || null;
      if (updates.time !== undefined) dbUpdates.time = updates.time || null;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.order !== undefined) dbUpdates.order_index = updates.order;
      if (updates.movedToSomedayAt !== undefined) dbUpdates.moved_to_someday_at = updates.movedToSomedayAt || null;
      if (updates.focusState !== undefined) dbUpdates.focus_state = updates.focusState;
      if (updates.focusStartedAt !== undefined) dbUpdates.focus_started_at = updates.focusStartedAt || null;
      if (updates.focusCompletedAt !== undefined) dbUpdates.focus_completed_at = updates.focusCompletedAt || null;
      if (updates.pomodorosCompleted !== undefined) dbUpdates.pomodoros_completed = updates.pomodorosCompleted;
      if (updates.estimatedPomodoros !== undefined) dbUpdates.estimated_pomodoros = updates.estimatedPomodoros || null;

      const { data, error } = await supabase
        .from('bullet_items')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bullet item:', error);
        throw error;
      }

      return dbRowToBulletItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletItems', user?.id] });
    },
  });
}

/**
 * Delete a bullet item from Supabase
 */
export function useDeleteBulletItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('bullet_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting bullet item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletItems', user?.id] });
    },
  });
}
