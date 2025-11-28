import { DailyQuest } from '@shared/schema';

/**
 * Daily Quest Definition
 * Defines the 7 fixed daily quests that rotate each day
 */
export interface DailyQuestDefinition {
  id: string;
  name: string;
  description: string;
  requirement: number;
  coinReward: number;
  xpReward: number;
  type: 'bullet-task-completion' | 'focus-session' | 'routine-based' | 'cosmetic-based';
}

/**
 * DAILY_QUEST_POOL
 * Fixed pool of 7 daily quests that rotate each day
 * Each user gets 3 random quests from this pool daily
 */
export const DAILY_QUEST_POOL: DailyQuestDefinition[] = [
  // ===== BULLET TASK COMPLETION QUESTS =====
  {
    id: 'warm-up',
    name: 'Warm Up',
    description: 'Complete 3 bullet journal tasks',
    requirement: 3,
    coinReward: 15,
    xpReward: 10,
    type: 'bullet-task-completion',
  },
  {
    id: 'power-hour',
    name: 'Power Hour',
    description: 'Complete 10 bullet journal tasks',
    requirement: 10,
    coinReward: 30,
    xpReward: 60,
    type: 'bullet-task-completion',
  },
  {
    id: 'productivity-master',
    name: 'Productivity Master',
    description: 'Complete 5 bullet journal tasks',
    requirement: 5,
    coinReward: 20,
    xpReward: 25,
    type: 'bullet-task-completion',
  },

  // ===== FOCUS SESSION QUESTS =====
  {
    id: 'focus-beginner',
    name: 'Focus Beginner',
    description: 'Complete 1 focus session',
    requirement: 1,
    coinReward: 20,
    xpReward: 15,
    type: 'focus-session',
  },
  {
    id: 'focus-pro',
    name: 'Focus Pro',
    description: 'Complete 3 focus sessions',
    requirement: 3,
    coinReward: 40,
    xpReward: 35,
    type: 'focus-session',
  },

  // ===== ROUTINE QUESTS =====
  {
    id: 'routine-crusher',
    name: 'Routine Crusher',
    description: 'Complete 3 tasks in your Daily Routine',
    requirement: 3,
    coinReward: 25,
    xpReward: 25,
    type: 'routine-based',
  },

  // ===== COSMETIC QUESTS =====
  {
    id: 'texture-ocd',
    name: 'Ah... Just Right',
    description: 'Equip your Howie with a different cosmetic',
    requirement: 1,
    coinReward: 25,
    xpReward: 25,
    type: 'cosmetic-based',
  },
];

/**
 * Generate random daily quests for a new day
 * Selects 3 random quests from the fixed pool
 */
export function generateDailyQuests(): DailyQuest[] {
  // Shuffle and select 3 random quests
  const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // Create quest instances from definitions
  return selected.map((quest) => ({
    id: quest.id,
    name: quest.name,
    description: quest.description,
    requirement: quest.requirement,
    progress: 0,
    coinReward: quest.coinReward,
    xpReward: quest.xpReward,
    completed: false,
    claimed: false,
    type: quest.type,
  }));
}

/**
 * Check if daily quests need to be reset (new day)
 * Returns true if it's a new day since last reset
 */
export function shouldResetDailyQuests(lastResetDate?: string): boolean {
  if (!lastResetDate) return true;

  const lastReset = new Date(lastResetDate);
  const now = new Date();

  // Check if it's a different calendar day
  return (
    lastReset.getFullYear() !== now.getFullYear() ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getDate() !== now.getDate()
  );
}

/**
 * Get the quest definition for a specific quest ID
 */
export function getDailyQuestDefinition(questId: string): DailyQuestDefinition | undefined {
  return DAILY_QUEST_POOL.find((q) => q.id === questId);
}
