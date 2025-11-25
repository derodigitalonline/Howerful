import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@shared/schema';

// Helper: Convert database row to Profile type
function dbRowToProfile(row: any): Profile {
  return {
    nickname: row.nickname || 'Howie',
    totalXP: row.total_xp || 0,
    level: row.level || 1,
    coins: row.coins || 0,
    tasksCompleted: row.tasks_completed || 0,
    doFirstTasksCompleted: row.do_first_tasks_completed || 0,
    hasCompletedOnboarding: row.has_completed_onboarding || false,
    selectedSprite: row.selected_sprite || null,
  };
}

// Helper: Convert Profile type to database row
function profileToDbRow(profile: Profile) {
  return {
    nickname: profile.nickname,
    total_xp: profile.totalXP,
    level: profile.level,
    coins: profile.coins,
    tasks_completed: profile.tasksCompleted,
    do_first_tasks_completed: profile.doFirstTasksCompleted,
    has_completed_onboarding: profile.hasCompletedOnboarding,
    selected_sprite: profile.selectedSprite,
  };
}

/**
 * Hook to fetch profile from Supabase
 * Returns null if user not logged in or Supabase not configured
 */
export function useSupabaseProfile() {
  const { user, isAuthenticated } = useAuth();
  const enabled = isSupabaseConfigured() && isAuthenticated && !!user;

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data ? dbRowToProfile(data) : null;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to update profile in Supabase
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<Profile>): Promise<Profile> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const dbRow = profileToDbRow(profile as Profile);

      const { data, error } = await supabase
        .from('profiles')
        .update(dbRow)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return dbRowToProfile(data);
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with the new profile
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
    },
  });
}

/**
 * Hook to award XP and handle leveling
 */
export function useAwardXP() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ xp }: { xp: number }): Promise<{ newLevel: number; leveledUp: boolean }> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      const newTotalXP = profile.totalXP + xp;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const leveledUp = newLevel > profile.level;

      await updateProfile.mutateAsync({
        ...profile,
        totalXP: newTotalXP,
        level: newLevel,
      });

      return { newLevel, leveledUp };
    },
  });
}

/**
 * Hook to add coins
 */
export function useAddCoins() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ coins }: { coins: number }): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        coins: profile.coins + coins,
      });
    },
  });
}

/**
 * Hook to deduct coins
 */
export function useDeductCoins() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ coins }: { coins: number }): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      const newCoins = Math.max(0, profile.coins - coins);
      await updateProfile.mutateAsync({
        ...profile,
        coins: newCoins,
      });
    },
  });
}

/**
 * Hook to increment tasks completed
 */
export function useIncrementTasksCompleted() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ isDoFirst = false }: { isDoFirst?: boolean } = {}): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        tasksCompleted: profile.tasksCompleted + 1,
        doFirstTasksCompleted: isDoFirst
          ? profile.doFirstTasksCompleted + 1
          : profile.doFirstTasksCompleted,
      });
    },
  });
}

/**
 * Hook to update nickname
 */
export function useUpdateNickname() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ nickname }: { nickname: string }): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        nickname,
      });
    },
  });
}

/**
 * Hook to complete onboarding
 */
export function useCompleteOnboarding() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        hasCompletedOnboarding: true,
      });
    },
  });
}

/**
 * Hook to select a sprite
 */
export function useSelectSprite() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ spriteId }: { spriteId: string | null }): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        selectedSprite: spriteId,
      });
    },
  });
}
