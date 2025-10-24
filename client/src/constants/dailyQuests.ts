import { DailyQuest, Quadrant } from '@shared/schema';

/**
 * Daily Quest Definition
 * Defines the 8 fixed daily quests that rotate each day
 */
export interface DailyQuestDefinition {
  id: string;
  name: string;
  description: string;
  requirement: number;
  coinReward: number;
  xpReward: number;
  type: 'task-completion' | 'quadrant-specific' | 'routine-based' | 'cosmetic-based' | 'cleanup-based';
  quadrant?: Quadrant; // For quadrant-specific quests
}

/**
 * DAILY_QUEST_POOL
 * Fixed pool of 8 daily quests that rotate each day
 * Each user gets 3 random quests from this pool daily
 */
export const DAILY_QUEST_POOL: DailyQuestDefinition[] = [
  // ===== TASK COMPLETION QUESTS =====
  {
    id: 'warm-up',
    name: 'Warm Up',
    description: 'Complete 3 tasks in any quadrant',
    requirement: 3,
    coinReward: 15,
    xpReward: 10,
    type: 'task-completion',
  },
  {
    id: 'power-hour',
    name: 'Power Hour',
    description: 'Complete 10 tasks in any quadrant',
    requirement: 10,
    coinReward: 30,
    xpReward: 60,
    type: 'task-completion',
  },

  // ===== QUADRANT-SPECIFIC QUESTS =====
  {
    id: 'urgent-master',
    name: 'Urgent Master',
    description: "Complete 3 tasks in the 'Urgent' quadrant",
    requirement: 3,
    coinReward: 40,
    xpReward: 35,
    type: 'quadrant-specific',
    quadrant: 'do-first',
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: "Complete 3 tasks in the 'Delegate' quadrant",
    requirement: 3,
    coinReward: 20,
    xpReward: 15,
    type: 'quadrant-specific',
    quadrant: 'delegate',
  },
  {
    id: 'eliminator',
    name: 'Eliminator',
    description: "Complete 3 tasks in the 'Eliminate' quadrant",
    requirement: 3,
    coinReward: 20,
    xpReward: 20,
    type: 'quadrant-specific',
    quadrant: 'eliminate',
  },

  // ===== SPECIAL ACTION QUESTS =====
  {
    id: 'routine-crusher',
    name: 'Routine Crusher',
    description: 'Complete 3 tasks in your Daily Routine',
    requirement: 3,
    coinReward: 25,
    xpReward: 25,
    type: 'routine-based',
  },
  {
    id: 'declutter',
    name: 'Declutter-er',
    description: "Use the 'Clean Completed Tasks' button to clean your quadrants",
    requirement: 1,
    coinReward: 15,
    xpReward: 15,
    type: 'cleanup-based',
  },
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
    quadrant: quest.quadrant,
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
