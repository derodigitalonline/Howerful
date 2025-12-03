import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { UserProfile, DailyQuest } from "@shared/schema";
import { getLevelFromXP, willLevelUp } from "../utils/xpCalculator";
import {
  generateDailyQuests,
  shouldResetDailyQuests,
  getDailyQuestDefinition,
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
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  resetProfile: () => void;
  completeOnboarding: (userName: string, howieName: string) => void;
  checkAndResetDailyQuests: () => void;
  claimDailyQuest: (questId: string) => boolean;
  unlockCosmeticReward: (cosmeticId: string) => void;
  addClaimedQuestToHistory: (questId: string) => void;
  trackRoutineCompletion: () => void;
  trackCosmeticChange: () => void;
  trackBulletTaskCompletion: () => void;
  trackFocusSessionCompletion: () => void;
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
    bulletTasksCompleted: 0,
    focusSessionsCompleted: 0,
    totalQuestsCompleted: 0,
    hasCompletedOnboarding: false,
    selectedSprite: undefined,
    userName: "User",
    howieName: "Howie",
  });
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedQuestReset = useRef(false); // Prevent infinite loop by only checking once per session

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

      // Load daily quests: use Supabase data if available, otherwise generate new
      let mergedQuests: DailyQuest[] = [];

      if (supabaseDailyQuests && supabaseDailyQuests.length > 0) {
        // Load quests from Supabase and merge with definitions
        // Filter out any old/invalid quests that don't exist in the current quest pool
        mergedQuests = supabaseDailyQuests
          .map(supabaseQuest => {
            const questDef = getDailyQuestDefinition(supabaseQuest.id);
            if (questDef) {
              return {
                ...questDef,
                progress: supabaseQuest.progress,
                completed: supabaseQuest.completed,
                claimed: supabaseQuest.claimed,
              };
            }
            // Quest definition not found (old Matrix quest) - filter it out
            return null;
          })
          .filter((quest): quest is DailyQuest => quest !== null);

        // If no valid quests remain after filtering, generate new ones
        if (mergedQuests.length === 0) {
          mergedQuests = generateDailyQuests();
        } else if (mergedQuests.length > 3) {
          // Safety check: If somehow we have more than 3 quests, only keep the first 3
          mergedQuests = mergedQuests.slice(0, 3);
        }
      } else {
        // No quests in Supabase, generate new ones
        // (This will be synced to Supabase by checkAndResetDailyQuests)
        mergedQuests = generateDailyQuests();
      }

      setProfile({
        // Basic fields from Supabase
        userName: supabaseProfile.userName,
        howieName: supabaseProfile.howieName,
        totalXP: supabaseProfile.totalXP,
        level: supabaseProfile.level,
        coins: supabaseProfile.coins,
        bulletTasksCompleted: supabaseProfile.bulletTasksCompleted || 0,
        focusSessionsCompleted: supabaseProfile.focusSessionsCompleted || 0,
        totalQuestsCompleted: supabaseProfile.totalQuestsCompleted || 0,
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

  // Check and reset daily quests when profile loads (only once per session)
  useEffect(() => {
    if (profile.hasCompletedOnboarding && !isLoading && !hasCheckedQuestReset.current) {
      hasCheckedQuestReset.current = true;

      // Force reset if we have the wrong number of quests (not exactly 3)
      const questCount = (profile.dailyQuests || []).length;
      if (questCount !== 3 && questCount !== 0) {
        console.log(`Invalid quest count (${questCount}), forcing reset...`);

        const newQuests = generateDailyQuests();

        // Clear old quests and add new ones to Supabase
        if (isAuthenticated && isSupabaseConfigured()) {
          deleteAllQuests.mutate();
          bulkUpsertQuests.mutate(newQuests);
        }

        setProfile(prev => ({
          ...prev,
          dailyQuests: newQuests,
          lastDailyQuestReset: new Date().toISOString(),
        }));
      } else {
        // Normal daily quest check
        checkAndResetDailyQuests();
      }
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
        userName: profile.userName,
        howieName: profile.howieName,
        totalXP: profile.totalXP,
        level: profile.level,
        coins: profile.coins,
        bulletTasksCompleted: profile.bulletTasksCompleted,
        focusSessionsCompleted: profile.focusSessionsCompleted,
        totalQuestsCompleted: profile.totalQuestsCompleted,
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
        selectedSprite: profile.selectedSprite || null,
      });
    }
  }, [
    profile.userName,
    profile.howieName,
    profile.totalXP,
    profile.level,
    profile.coins,
    profile.bulletTasksCompleted,
    profile.focusSessionsCompleted,
    profile.totalQuestsCompleted,
    profile.hasCompletedOnboarding,
    profile.selectedSprite,
    isLoading,
    isAuthenticated,
    user,
  ]);

  // NOTE: We don't sync daily quests in a useEffect to avoid infinite loops.
  // Quests are synced when they're actually modified (completed, claimed, reset).

  // Sync cosmetic data to Supabase when it changes
  useEffect(() => {
    if (!isLoading && isAuthenticated && isSupabaseConfigured() && user && profile.equippedCosmetics) {
      updateEquippedCosmetics.mutate(profile.equippedCosmetics);
    }
  }, [profile.equippedCosmetics, isLoading, isAuthenticated, user]);

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
   * Complete onboarding with userName and howieName
   */
  const completeOnboarding = (userName: string, howieName: string): void => {
    console.log('useProfile: completeOnboarding called with:', { userName, howieName });
    setProfile((prev) => {
      const newProfile = {
        ...prev,
        hasCompletedOnboarding: true,
        selectedSprite: 'default', // Always assign default sprite on onboarding
        userName: userName || 'User', // Fallback to "User" if empty
        howieName: howieName || 'Howie', // Fallback to "Howie" if empty
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
      bulletTasksCompleted: 0,
      focusSessionsCompleted: 0,
      totalQuestsCompleted: 0,
      hasCompletedOnboarding: false,
      selectedSprite: undefined,
      userName: "User",
      howieName: "Howie",
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
   * Unlock a cosmetic reward (for Story Quest completion)
   * Syncs to Supabase if authenticated
   */
  const unlockCosmeticReward = (cosmeticId: string): void => {
    // Update local state
    setProfile((prev) => ({
      ...prev,
      unlockedCosmetics: [...(prev.unlockedCosmetics || []), cosmeticId],
    }));

    // Sync to Supabase if authenticated
    if (isAuthenticated && isSupabaseConfigured()) {
      unlockCosmetic.mutate(cosmeticId);
    }
  };

  /**
   * Add a quest to claimed quests history (for Story Quest completion)
   * Syncs to Supabase if authenticated
   */
  const addClaimedQuestToHistory = (questId: string): void => {
    // Update local state
    setProfile((prev) => ({
      ...prev,
      claimedQuests: [...(prev.claimedQuests || []), questId],
    }));

    // Sync to Supabase if authenticated
    if (isAuthenticated && isSupabaseConfigured()) {
      addClaimedQuest.mutate(questId);
    }
  };

  /**
   * Track routine completion for daily quests
   * Called when user completes a routine item
   */
  const trackRoutineCompletion = (): void => {
    let questsToSync: DailyQuest[] = [];

    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'routine-based') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        const updatedQuest = { ...quest, progress: newProgress, completed: isNowCompleted };
        questsToSync.push(updatedQuest);
        return updatedQuest;
      });

      return { ...prev, dailyQuests: updatedDailyQuests };
    });

    // Sync updated quests to Supabase
    if (isAuthenticated && isSupabaseConfigured() && questsToSync.length > 0) {
      questsToSync.forEach(quest => {
        upsertDailyQuest.mutate(quest);
      });
    }
  };

  /**
   * Track cosmetic change for daily quests
   * Called when user equips a cosmetic
   */
  const trackCosmeticChange = (): void => {
    let questsToSync: DailyQuest[] = [];

    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'cosmetic-based') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        const updatedQuest = { ...quest, progress: newProgress, completed: isNowCompleted };
        questsToSync.push(updatedQuest);
        return updatedQuest;
      });

      return { ...prev, dailyQuests: updatedDailyQuests };
    });

    // Sync updated quests to Supabase
    if (isAuthenticated && isSupabaseConfigured() && questsToSync.length > 0) {
      questsToSync.forEach(quest => {
        upsertDailyQuest.mutate(quest);
      });
    }
  };

  /**
   * Track bullet task completion for quests
   * Called when user completes a bullet journal task
   */
  const trackBulletTaskCompletion = (): void => {
    let questsToSync: DailyQuest[] = [];

    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'bullet-task-completion') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        const updatedQuest = { ...quest, progress: newProgress, completed: isNowCompleted };
        questsToSync.push(updatedQuest);
        return updatedQuest;
      });

      return {
        ...prev,
        bulletTasksCompleted: (prev.bulletTasksCompleted || 0) + 1,
        dailyQuests: updatedDailyQuests,
      };
    });

    // Sync updated quests to Supabase
    if (isAuthenticated && isSupabaseConfigured() && questsToSync.length > 0) {
      questsToSync.forEach(quest => {
        upsertDailyQuest.mutate(quest);
      });
    }
  };

  /**
   * Track focus session completion for quests
   * Called when user completes a focus session
   */
  const trackFocusSessionCompletion = (): void => {
    let questsToSync: DailyQuest[] = [];

    setProfile(prev => {
      const updatedDailyQuests = (prev.dailyQuests || []).map(quest => {
        if (quest.completed || quest.claimed) return quest;
        if (quest.type !== 'focus-session') return quest;

        const newProgress = quest.progress + 1;
        const isNowCompleted = newProgress >= quest.requirement;
        const updatedQuest = { ...quest, progress: newProgress, completed: isNowCompleted };
        questsToSync.push(updatedQuest);
        return updatedQuest;
      });

      return {
        ...prev,
        focusSessionsCompleted: (prev.focusSessionsCompleted || 0) + 1,
        dailyQuests: updatedDailyQuests,
      };
    });

    // Sync updated quests to Supabase
    if (isAuthenticated && isSupabaseConfigured() && questsToSync.length > 0) {
      questsToSync.forEach(quest => {
        upsertDailyQuest.mutate(quest);
      });
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        addXP,
        addCoins,
        deductCoins,
        resetProfile,
        completeOnboarding,
        checkAndResetDailyQuests,
        claimDailyQuest,
        unlockCosmeticReward,
        addClaimedQuestToHistory,
        trackRoutineCompletion,
        trackCosmeticChange,
        trackBulletTaskCompletion,
        trackFocusSessionCompletion,
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
