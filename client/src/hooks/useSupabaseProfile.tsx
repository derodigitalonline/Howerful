import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@shared/schema';

// Helper: Convert database row to UserProfile type
function dbRowToProfile(row: any): UserProfile {
  return {
    userName: row.user_name || 'User',
    howieName: row.howie_name || 'Howie',
    totalXP: row.total_xp || 0,
    level: row.level || 1,
    coins: row.coins || 0,
    bulletTasksCompleted: row.bullet_tasks_completed || 0,
    focusSessionsCompleted: row.focus_sessions_completed || 0,
    totalQuestsCompleted: row.total_quests_completed || 0,
    hasCompletedOnboarding: row.has_completed_onboarding || false,
    selectedSprite: row.selected_sprite || null,
  };
}

// Helper: Convert UserProfile type to database row
function profileToDbRow(profile: UserProfile) {
  return {
    user_name: profile.userName,
    howie_name: profile.howieName,
    total_xp: profile.totalXP,
    level: profile.level,
    coins: profile.coins,
    bullet_tasks_completed: profile.bulletTasksCompleted,
    focus_sessions_completed: profile.focusSessionsCompleted,
    total_quests_completed: profile.totalQuestsCompleted,
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
    queryFn: async (): Promise<UserProfile | null> => {
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
    staleTime: 1000 * 10, // Consider data fresh for 10 seconds
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to update profile in Supabase
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const dbRow = profileToDbRow(profile as UserProfile);

      // Use upsert instead of update to handle first-time profile creation
      // This ensures the profile is created even if the trigger failed
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, ...dbRow },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Error upserting profile:', error);
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
 * Hook to update userName (user's actual first name)
 */
export function useUpdateUserName() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ userName }: { userName: string }): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        userName,
      });
    },
  });
}

/**
 * Hook to update howieName (Howie companion's nickname)
 */
export function useUpdateHowieName() {
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({ howieName }: { howieName: string }): Promise<void> => {
      if (!profile) {
        throw new Error('Profile not loaded');
      }

      await updateProfile.mutateAsync({
        ...profile,
        howieName,
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
