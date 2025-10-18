import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, Quadrant, XP_REWARDS } from "@shared/schema";
import { getLevelFromXP, willLevelUp } from "../utils/xpCalculator";

const STORAGE_KEY = "eisenhower-profile";

export interface XPGainResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  oldLevel: number;
}

interface ProfileContextType {
  profile: UserProfile;
  awardXP: (quadrant: Quadrant) => XPGainResult;
  deductXP: (quadrant: Quadrant) => void;
  resetProfile: () => void;
  completeOnboarding: (selectedSprite: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    totalXP: 0,
    level: 1,
    tasksCompleted: 0,
    hasCompletedOnboarding: false,
    selectedSprite: undefined,
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      } catch (e) {
        console.error("Failed to parse stored profile", e);
      }
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  /**
   * Award XP for completing a task
   */
  const awardXP = (quadrant: Quadrant): XPGainResult => {
    const xpGained = XP_REWARDS[quadrant];
    const oldLevel = profile.level;
    const leveledUp = willLevelUp(profile.totalXP, xpGained);
    const newTotalXP = profile.totalXP + xpGained;
    const newLevel = getLevelFromXP(newTotalXP);

    setProfile((prev) => ({
      ...prev,
      totalXP: newTotalXP,
      level: newLevel,
      tasksCompleted: prev.tasksCompleted + 1,
    }));

    return {
      xpGained,
      leveledUp,
      newLevel,
      oldLevel,
    };
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
   * Complete onboarding with selected sprite
   */
  const completeOnboarding = (selectedSprite: string): void => {
    console.log('useProfile: completeOnboarding called with:', selectedSprite);
    setProfile((prev) => {
      const newProfile = {
        ...prev,
        hasCompletedOnboarding: true,
        selectedSprite,
      };
      console.log('useProfile: New profile state:', newProfile);
      return newProfile;
    });
  };

  /**
   * Reset profile (for debugging or user request)
   */
  const resetProfile = (): void => {
    setProfile({
      totalXP: 0,
      level: 1,
      tasksCompleted: 0,
      hasCompletedOnboarding: false,
      selectedSprite: undefined,
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        awardXP,
        deductXP,
        resetProfile,
        completeOnboarding,
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
