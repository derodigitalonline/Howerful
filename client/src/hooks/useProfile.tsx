import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, Quadrant, XP_REWARDS, COIN_REWARDS, DailyQuest } from "@shared/schema";
import { getLevelFromXP, willLevelUp } from "../utils/xpCalculator";
import {
  generateDailyQuests,
  shouldResetDailyQuests,
} from "../constants/dailyQuests";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseProfile, useUpdateProfile } from "./useSupabaseProfile";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  useSupabaseDailyQuests,
  useUpsertDailyQuest,
  useBulkUpsertDailyQuests,
  useDeleteAllDailyQuests,
  useSupabaseQuestInbox,
  useAddToQuestInbox,
  useRemoveFromQuestInbox,
  useSupabaseClaimedQuests,
  useAddClaimedQuest,
  useSupabaseUnlockedCosmetics,
  useUnlockCosmetic,
  useSupabaseEquippedCosmetics,
  useUpdateEquippedCosmetics,
} from "./useSupabaseQuests";

const STORAGE_KEY = "eisenhower-profile";

export interface XPGainResult {
  xpGained: number;
  coinsGained: number;
  leveledUp: boolean;
  newLevel: number;
  oldLevel: number;
}

interface ProfileContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  awardXP: (quadrant: Quadrant) => XPGainResult;
  addXP: (amount: number) => void;
  deductXP: (quadrant: Quadrant) => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  resetProfile: () => void;
  completeOnboarding: (nickname: string) => void;
  checkAndResetDailyQuests: () => void;
  claimDailyQuest: (questId: string) => boolean;
  trackRoutineCompletion: () => void;
  trackCosmeticChange: () => void;
  trackCleanupEvent: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { data: supabaseProfile, isLoading: supabaseLoading } = useSupabaseProfile();
  const updateProfile = useUpdateProfile();

  // Quest hooks
  const { data: supabaseDailyQuests, isLoading: questsLoading } = useSupabaseDailyQuests();
  const upsertDailyQuest = useUpsertDailyQuest();
  const bulkUpsertQuests = useBulkUpsertDailyQuests();
  const deleteAllQuests = useDeleteAllDailyQuests();
  const { data: supabaseInbox, isLoading: inboxLoading } = useSupabaseQuestInbox();
  const addToInbox = useAddToQuestInbox();
  const removeFromInbox = useRemoveFromQuestInbox();
  const { data: supabaseClaimedQuests, isLoading: claimedLoading } = useSupabaseClaimedQuests();
  const addClaimedQuest = useAddClaimedQuest();

  // Cosmetic hooks
  const { data: supabaseUnlockedCosmetics, isLoading: unlockedLoading } = useSupabaseUnlockedCosmetics();
  const unlockCosmetic = useUnlockCosmetic();
  const { data: supabaseEquippedCosmetics, isLoading: equippedLoading } = useSupabaseEquippedCosmetics();
  const updateEquippedCosmetics = useUpdateEquippedCosmetics();

  const [profile, setProfile] = useState<UserProfile>({
    totalXP: 0,
    level: 1,
    coins: 0,
    tasksCompleted: 0,
    hasCompletedOnboarding: false,
    selectedSprite: undefined,
    nickname: "Howie",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load profile on mount: Supabase if logged in, otherwise localStorage
  useEffect(() => {
    if (isAuthenticated && (supabaseLoading || questsLoading || inboxLoading || claimedLoading || unlockedLoading || equippedLoading)) {
      // Still loading from Supabase, wait
      return;
    }

    if (isAuthenticated && supabaseProfile) {
      // Logged in: Load from Supabase
      const stored = localStorage.getItem(STORAGE_KEY);
      let localData: Partial<UserProfile> = {};

      if (stored) {
        try {
          localData = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored profile", e);
        }
      }

      // Merge quest definitions with Supabase progress data
      const allQuests = generateDailyQuests();
      const mergedQuests = allQuests.map(questDef => {
        const supabaseQuest = supabaseDailyQuests?.find(q => q.id === questDef.id);
        if (supabaseQuest) {
          return {
            ...questDef,
            progress: supabaseQuest.progress,
            completed: supabaseQuest.completed,
            claimed: supabaseQuest.claimed,
          };
        }
        return questDef;
      });

      setProfile({
        // Basic fields from Supabase
        nickname: supabaseProfile.nickname,
        totalXP: supabaseProfile.totalXP,
        level: supabaseProfile.level,
        coins: supabaseProfile.coins,
        tasksCompleted: supabaseProfile.tasksCompleted,
        doFirstTasksCompleted: supabaseProfile.doFirstTasksCompleted,
        hasCompletedOnboarding: supabaseProfile.hasCompletedOnboarding,
        selectedSprite: supabaseProfile.selectedSprite || undefined,
        // Quest fields from Supabase
        dailyQuests: mergedQuests,
        lastDailyQuestReset: localData.lastDailyQuestReset, // Still in localStorage for now
        inbox: supabaseInbox || [],
        claimedQuests: supabaseClaimedQuests || [],
        // Cosmetic fields from Supabase
        unlockedCosmetics: supabaseUnlockedCosmetics || [],
        equippedCosmetics: supabaseEquippedCosmetics || undefined,
      });
      setIsLoading(false);
    } else {
      // Not logged in: Load from localStorage only
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
        } catch (e) {
          console.error("Failed to parse stored profile", e);
        }
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, supabaseProfile, supabaseLoading, supabaseDailyQuests, questsLoading, supabaseInbox, inboxLoading, supabaseClaimedQuests, claimedLoading, supabaseUnlockedCosmetics, unlockedLoading, supabaseEquippedCosmetics, equippedLoading]);

  // Check and reset daily quests when profile loads
  useEffect(() => {
    if (profile.hasCompletedOnboarding && !isLoading) {
      checkAndResetDailyQuests();
    }
  }, [profile.hasCompletedOnboarding, isLoading]);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, isLoading]);

  // Sync basic profile fields to Supabase when they change
  useEffect(() => {
    if (!isLoading && isAuthenticated && isSupabaseConfigured() && user) {
      updateProfile.mutate({
        nickname: profile.nickname,
        totalXP: profile.totalXP,
        level: profile.level,
        coins: profile.coins,
        tasksCompleted: profile.tasksCompleted,
        doFirstTasksCompleted: profile.doFirstTasksCompleted,
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
        selectedSprite: profile.selectedSprite || null,
      });
    }
  }, [
    profile.nickname,
    profile.totalXP,
    profile.level,
    profile.coins,
    profile.tasksCompleted,
    profile.doFirstTasksCompleted,
    profile.hasCompletedOnboarding,
    profile.selectedSprite,
    isLoading,
    isAuthenticated,
    user,
  ]);

  // Sync quest data to Supabase when it changes
  useEffect(() => {
    if (!isLoading && isAuthenticated && isSupabaseConfigured() && user && profile.dailyQuests) {
      // Sync each quest to Supabase
      profile.dailyQuests.forEach(quest => {
        upsertDailyQuest.mutate(quest);
      });
    }
  }, [profile.dailyQuests, isLoading, isAuthenticated, user]);

  // Sync cosmetic data to Supabase when it changes
  useEffect(() => {
    if (!isLoading && isAuthenticated && isSupabaseConfigured() && user && profile.equippedCosmetics) {
      updateEquippedCosmetics.mutate(profile.equippedCosmetics);
    }
  }, [profile.equippedCosmetics, isLoading, isAuthenticated, user]);

  /**
   * Award XP and Coins for completing a task
   */
  const awardXP = (quadrant: Quadrant): XPGainResult => {
    const xpGained = XP_REWARDS[quadrant];
    const coinsGained = COIN_REWARDS[quadrant];
    const oldLevel = profile.level;
    const leveledUp = willLevelUp(profile.totalXP, xpGained);
    const newTotalXP = profile.totalXP + xpGained;
    const newLevel = getLevelFromXP(newTotalXP);

    setProfile((prev) => {
      // Update daily quest progress
      const updatedDailyQuests = (prev.dailyQuests || []).map((quest) => {
        if (quest.completed || quest.claimed) return quest;

        let newProgress = quest.progress;

        // Update progress based on quest type
        if (quest.type === 'task-completion') {
          newProgress = quest.progress + 1;
        } else if (quest.type === 'quadrant-specific' && quest.quadrant === quadrant) {
          newProgress = quest.progress + 1;
        }
        // Note: routine-based, cosmetic-based, cleanup-based are tracked via separate functions

        const isNowCompleted = newProgress >= quest.requirement;

        return {
          ...quest,
          progress: newProgress,
          completed: isNowCompleted,
        };
      });

      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        coins: (prev.coins || 0) + coinsGained,
        tasksCompleted: prev.tasksCompleted + 1,
        doFirstTasksCompleted: quadrant === 'do-first'
          ? (prev.doFirstTasksCompleted || 0) + 1
          : (prev.doFirstTasksCompleted || 0),
        dailyQuests: updatedDailyQuests,
      };
    });

    return {
      xpGained,
      coinsGained,
      leveledUp,
      newLevel,
      oldLevel,
    };
  };

  /**
   * Add XP directly without incrementing tasks completed (for dev tools)
   */
  const addXP = (amount: number): void => {
    const newTotalXP = profile.totalXP + amount;
    const newLevel = getLevelFromXP(newTotalXP);

    setProfile((prev) => ({
      ...prev,
      totalXP: newTotalXP,
      level: newLevel,
    }));
  };

  /**
   * Deduct XP when uncompleting a task (optional feature)
   */
  const deductXP = (quadrant: Quadrant): void => {
    const xpLost = XP_REWARDS[quadrant];
    const newTotalXP = Math.max(0, profile.totalXP - xpLost);
    const newLevel = getLevelFromXP(newTotalXP);

    setProfile((prev) => ({
      ...prev,
      totalXP: newTotalXP,
      level: newLevel,
      tasksCompleted: Math.max(0, prev.tasksCompleted - 1),
    }));
  };

  /**
   * Complete onboarding with nickname
   */
  const completeOnboarding = (nickname: string): void => {
    console.log('useProfile: completeOnboarding called with nickname:', nickname);
    setProfile((prev) => {
      const newProfile = {
        ...prev,
        hasCompletedOnboarding: true,
        selectedSprite: 'default', // Always assign default sprite on onboarding
        nickname: nickname || 'Howie', // Fallback to "Howie" if empty
      };
      console.log('useProfile: New profile state:', newProfile);
      return newProfile;
    });
  };

  /**
   * Add coins directly (for quest rewards, achievements, etc.)
   */
  const addCoins = (amount: number): void => {
    setProfile((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + amount,
    }));
  };

  /**
   * Deduct coins (for shop purchases)
   * Returns true if successful, false if insufficient coins
   */
  const deductCoins = (amount: number): boolean => {
    if ((profile.coins || 0) < amount) {
      return false; // Insufficient coins
    }

    setProfile((prev) => ({
      ...prev,
      coins: (prev.coins || 0) - amount,
    }));

    return true; // Success
  };

  /**
   * Reset profile (for debugging or user request)
   */
  const resetProfile = (): void => {
    setProfile({
      totalXP: 0,
      level: 1,
      coins: 0,
      tasksCompleted: 0,
      hasCompletedOnboarding: false,
      selectedSprite: undefined,
      nickname: "Howie",
      dailyQuests: [],
      lastDailyQuestReset: undefined,
      inbox: [],
      claimedQuests: [],
      unlockedCosmetics: [],
    });
  };

  /**
   * Check if it's a new day and reset daily quests if needed
   * Moves unclaimed completed quest rewards to inbox
   */
  const checkAndResetDailyQuests = (): void => {
    if (!shouldResetDailyQuests(profile.lastDailyQuestReset)) {
      return;
    }

    setProfile((prev) => {
      const currentQuests = prev.dailyQuests || [];

      // Move unclaimed completed quests to inbox
      const unclaimedRewards = currentQuests
        .filter(q => q.completed && !q.claimed)
        .map(q => ({
          id: crypto.randomUUID(),
          questId: q.id,
          questName: q.name,
          coinReward: q.coinReward,
          xpReward: q.xpReward,
          timestamp: new Date().toISOString(),
        }));

      // Sync to Supabase if authenticated
      if (isAuthenticated && isSupabaseConfigured()) {
        // Add unclaimed rewards to Supabase inbox
        unclaimedRewards.forEach(reward => {
          addToInbox.mutate({
            questId: reward.questId,
            questName: reward.questName,
            coinReward: reward.coinReward,
            xpReward: reward.xpReward,
          });
        });

        // Delete old quests and add new ones to Supabase
        deleteAllQuests.mutate();
        const newQuests = generateDailyQuests();
        bulkUpsertQuests.mutate(newQuests);
      }

      return {
        ...prev,
        dailyQuests: generateDailyQuests(),
        lastDailyQuestReset: new Date().toISOString(),
        inbox: [...(prev.inbox || []), ...unclaimedRewards],
      };
    });
  };

  /**
   * Claim a completed daily quest's rewards
   * Returns true if successful, false if already claimed or not completed
   */
  const claimDailyQuest = (questId: string): boolean => {
    const quest = profile.dailyQuests?.find((q) => q.id === questId);

    if (!quest || !quest.completed || quest.claimed) {
      return false;
    }

    // Sync to Supabase if authenticated
    if (isAuthenticated && isSupabaseConfigured()) {
      // Mark quest as claimed in Supabase
      upsertDailyQuest.mutate({ ...quest, claimed: true });
      // Add to claimed quests history
      addClaimedQuest.mutate(questId);
    }

    // Award rewards
    setProfile((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + quest.coinReward,
      totalXP: prev.totalXP + quest.xpReward,
      level: getLevelFromXP(prev.totalXP + quest.xpReward),
      dailyQuests: (prev.dailyQuests || []).map((q) =>
        q.id === questId ? { ...q, claimed: true } : q
      ),
      claimedQuests: [...(prev.claimedQuests || []), questId],
    }));

    return true;
  };

  /**
   * Track routine completion for daily quests
   * Called when user completes a routine item
   */
  const trackRoutineCompletion = (): void => {
    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'routine-based') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        return { ...quest, progress: newProgress, completed: isNowCompleted };
      });

      return { ...prev, dailyQuests: updatedDailyQuests };
    });
  };

  /**
   * Track cosmetic change for daily quests
   * Called when user equips a cosmetic
   */
  const trackCosmeticChange = (): void => {
    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'cosmetic-based') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        return { ...quest, progress: newProgress, completed: isNowCompleted };
      });

      return { ...prev, dailyQuests: updatedDailyQuests };
    });
  };

  /**
   * Track cleanup event for daily quests
   * Called when user uses 'Clean Completed Tasks' button
   */
  const trackCleanupEvent = (): void => {
    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'cleanup-based') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        return { ...quest, progress: newProgress, completed: isNowCompleted };
      });

      return { ...prev, dailyQuests: updatedDailyQuests };
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        awardXP,
        addXP,
        deductXP,
        addCoins,
        deductCoins,
        resetProfile,
        completeOnboarding,
        checkAndResetDailyQuests,
        claimDailyQuest,
        trackRoutineCompletion,
        trackCosmeticChange,
        trackCleanupEvent,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
