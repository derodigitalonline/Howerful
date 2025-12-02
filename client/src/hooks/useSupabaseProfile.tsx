import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@shared/schema';

// Helper: Convert database row to UserProfile type
function dbRowToProfile(row: any): UserProfile {
  return {
    userName: row.user_name || 'User',
    howieName: row.howie_name || 'Howie',
    profilePictureUrl: row.profile_picture_url || undefined,
    totalXP: row.total_xp || 0,
    level: row.level || 1,
    coins: row.coins || 0,
    bulletTasksCompleted: row.bullet_tasks_completed || 0,
    focusSessionsCompleted: row.focus_sessions_completed || 0,
    hasCompletedOnboarding: row.has_completed_onboarding || false,
    selectedSprite: row.selected_sprite || null,
  };
}

// Helper: Convert UserProfile type to database row
function profileToDbRow(profile: UserProfile) {
  return {
    user_name: profile.userName,
    howie_name: profile.howieName,
    profile_picture_url: profile.profilePictureUrl || null,
    total_xp: profile.totalXP,
    level: profile.level,
    coins: profile.coins,
    bullet_tasks_completed: profile.bulletTasksCompleted,
    focus_sessions_completed: profile.focusSessionsCompleted,
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
    mutationFn: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const dbRow = profileToDbRow(profile as UserProfile);

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

/**
 * Hook to upload profile picture
 * Uploads image to Supabase Storage and updates profile with URL
 * Max file size: 1MB
 */
export function useUploadProfilePicture() {
  const { user } = useAuth();
  const { data: profile } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!profile) {
        throw new Error('Profile not loaded');
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      // Validate file size (1MB max)
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > MAX_SIZE) {
        throw new Error('File size must be less than 1MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Delete old profile picture if exists
      if (profile.profilePictureUrl) {
        const oldPath = profile.profilePictureUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profile-pictures')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new file with unique name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update profile with new URL
      await updateProfile.mutateAsync({
        ...profile,
        profilePictureUrl: publicUrl,
      });

      return publicUrl;
    },
    onSuccess: () => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}
