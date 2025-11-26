import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { DailyQuest, InboxItem } from '@shared/schema';

// ============================================================================
// DAILY QUESTS
// ============================================================================

// Helper: Convert database row to DailyQuest type
function dbRowToDailyQuest(row: any): DailyQuest {
  return {
    id: row.quest_id,
    name: '', // Name comes from quest definitions, not stored in DB
    description: '', // Description comes from quest definitions
    requirement: 0, // Comes from quest definitions
    progress: row.progress || 0,
    coinReward: 0, // Comes from quest definitions
    xpReward: 0, // Comes from quest definitions
    completed: row.completed || false,
    claimed: row.claimed || false,
    type: 'task-completion', // Comes from quest definitions
  };
}

/**
 * Hook to fetch daily quests from Supabase
 */
export function useSupabaseDailyQuests() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['dailyQuests', user?.id],
    queryFn: async (): Promise<DailyQuest[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching daily quests:', error);
        throw error;
      }

      return data ? data.map(dbRowToDailyQuest) : [];
    },
    enabled,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to upsert (insert or update) a daily quest
 */
export function useUpsertDailyQuest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quest: DailyQuest): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('daily_quests')
        .upsert({
          user_id: user.id,
          quest_id: quest.id,
          progress: quest.progress,
          completed: quest.completed,
          claimed: quest.claimed,
        }, {
          onConflict: 'user_id,quest_id',
        });

      if (error) {
        console.error('Error upserting daily quest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyQuests', user?.id] });
    },
  });
}

/**
 * Hook to bulk upsert daily quests (for daily reset)
 */
export function useBulkUpsertDailyQuests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quests: DailyQuest[]): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const dbRows = quests.map(quest => ({
        user_id: user.id,
        quest_id: quest.id,
        progress: quest.progress,
        completed: quest.completed,
        claimed: quest.claimed,
      }));

      const { error } = await supabase
        .from('daily_quests')
        .upsert(dbRows, {
          onConflict: 'user_id,quest_id',
        });

      if (error) {
        console.error('Error bulk upserting daily quests:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyQuests', user?.id] });
    },
  });
}

/**
 * Hook to delete all daily quests (for daily reset)
 */
export function useDeleteAllDailyQuests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('daily_quests')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting daily quests:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyQuests', user?.id] });
    },
  });
}

// ============================================================================
// QUEST INBOX
// ============================================================================

// Helper: Convert database row to InboxItem type
function dbRowToInboxItem(row: any): InboxItem {
  return {
    id: row.id,
    questId: row.quest_id,
    questName: row.quest_name,
    coinReward: row.coin_reward,
    xpReward: row.xp_reward,
    timestamp: row.created_at,
  };
}

/**
 * Hook to fetch quest inbox from Supabase
 */
export function useSupabaseQuestInbox() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['questInbox', user?.id],
    queryFn: async (): Promise<InboxItem[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('quest_inbox')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quest inbox:', error);
        throw error;
      }

      return data ? data.map(dbRowToInboxItem) : [];
    },
    enabled,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to add item to quest inbox
 */
export function useAddToQuestInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<InboxItem, 'id' | 'timestamp'>): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('quest_inbox')
        .insert({
          user_id: user.id,
          quest_id: item.questId,
          quest_name: item.questName,
          coin_reward: item.coinReward,
          xp_reward: item.xpReward,
        });

      if (error) {
        console.error('Error adding to quest inbox:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questInbox', user?.id] });
    },
  });
}

/**
 * Hook to remove item from quest inbox
 */
export function useRemoveFromQuestInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('quest_inbox')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing from quest inbox:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questInbox', user?.id] });
    },
  });
}

// ============================================================================
// CLAIMED QUESTS
// ============================================================================

/**
 * Hook to fetch claimed quests from Supabase
 */
export function useSupabaseClaimedQuests() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['claimedQuests', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('claimed_quests')
        .select('quest_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching claimed quests:', error);
        throw error;
      }

      return data ? data.map(row => row.quest_id) : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to add claimed quest
 */
export function useAddClaimedQuest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('claimed_quests')
        .insert({
          user_id: user.id,
          quest_id: questId,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error adding claimed quest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claimedQuests', user?.id] });
    },
  });
}

// ============================================================================
// COSMETICS
// ============================================================================

/**
 * Hook to fetch unlocked cosmetics from Supabase
 */
export function useSupabaseUnlockedCosmetics() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['unlockedCosmetics', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('unlocked_cosmetics')
        .select('cosmetic_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching unlocked cosmetics:', error);
        throw error;
      }

      return data ? data.map(row => row.cosmetic_id) : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to unlock a cosmetic
 */
export function useUnlockCosmetic() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cosmeticId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('unlocked_cosmetics')
        .insert({
          user_id: user.id,
          cosmetic_id: cosmeticId,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error unlocking cosmetic:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlockedCosmetics', user?.id] });
    },
  });
}

/**
 * Hook to fetch equipped cosmetics from Supabase
 */
export function useSupabaseEquippedCosmetics() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['equippedCosmetics', user?.id],
    queryFn: async (): Promise<Record<string, string | undefined>> => {
      if (!user?.id) return {};

      const { data, error } = await supabase
        .from('equipped_cosmetics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching equipped cosmetics:', error);
        throw error;
      }

      if (!data) return {};

      return {
        hat: data.hat || undefined,
        shirt: data.shirt || undefined,
        pants: data.pants || undefined,
        cape: data.cape || undefined,
        pet: data.pet || undefined,
        facewear: data.facewear || undefined,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to update equipped cosmetics
 */
export function useUpdateEquippedCosmetics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cosmetics: Record<string, string | undefined>): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('equipped_cosmetics')
        .upsert({
          user_id: user.id,
          hat: cosmetics.hat || null,
          shirt: cosmetics.shirt || null,
          pants: cosmetics.pants || null,
          cape: cosmetics.cape || null,
          pet: cosmetics.pet || null,
          facewear: cosmetics.facewear || null,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error updating equipped cosmetics:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equippedCosmetics', user?.id] });
    },
  });
}
