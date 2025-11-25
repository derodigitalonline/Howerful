import { z } from "zod";

export const quadrants = ["do-first", "schedule", "delegate", "eliminate"] as const;
export type Quadrant = typeof quadrants[number];

// Workspace types for task organization
export const workspaces = ["personal", "work"] as const;
export type Workspace = typeof workspaces[number];

// XP rewards per quadrant (Do First tasks worth more!)
export const XP_REWARDS: Record<Quadrant, number> = {
  "do-first": 20,
  "schedule": 10,
  "delegate": 10,
  "eliminate": 5,
};

export const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  quadrant: z.enum(quadrants).optional(), // Optional for brain dump tasks
  workspace: z.enum(workspaces).default("personal"), // Which matrix this task belongs to
  createdAt: z.number(),
  completed: z.boolean().default(false),
  completedInQuadrant: z.enum(quadrants).optional(), // Track which quadrant task was completed in
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = Omit<Task, "id" | "createdAt">;

// Avatar Customization System
// Using literal types ensures TypeScript knows exactly which categories exist
export const cosmeticCategories = ["hat", "shirt", "pants", "cape", "pet", "facewear"] as const;
export type CosmeticCategory = typeof cosmeticCategories[number];

// CosmeticItem represents a single cosmetic asset
export interface CosmeticItem {
  id: string;                    // Unique identifier (e.g., 'hat-wizard')
  name: string;                  // Display name for UI
  category: CosmeticCategory;    // Which slot it occupies
  imagePath: string;             // Path to the PNG asset
  description?: string;          // Optional flavor text
  unlockLevel?: number;          // Level requirement to use this item
  unlockQuest?: string;          // Quest ID requirement (for future)
  coinPrice?: number;            // Cost in Howie Coins (if purchasable from Bazaar)
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; // Visual styling hint
  zIndex?: number;               // Custom layering order (optional)
}

// EquippedCosmetics tracks what the user currently has equipped
// Each category can have at most ONE item equipped (or undefined for nothing)
export interface EquippedCosmetics {
  hat?: string;      // ID of equipped hat
  shirt?: string;    // ID of equipped shirt
  pants?: string;    // ID of equipped pants
  cape?: string;     // ID of equipped cape
  pet?: string;      // ID of equipped pet companion
  facewear?: string; // ID of equipped facewear (glasses, masks, etc.)
}

// Coin rewards per quadrant (bonus currency for shop purchases)
export const COIN_REWARDS: Record<Quadrant, number> = {
  "do-first": 10,
  "schedule": 5,
  "delegate": 5,
  "eliminate": 2,
};

// Bullet Journal task rewards (for Dojo tasks)
export const BULLET_TASK_XP_REWARD = 10;
export const BULLET_TASK_COIN_REWARD = 5;

// Daily Quest System
export const dailyQuestSchema = z.object({
  id: z.string(),                    // Quest ID (e.g., 'warm-up', 'urgent-master')
  name: z.string(),                  // Display name
  description: z.string(),           // Requirements description
  requirement: z.number(),           // How many needed to complete
  progress: z.number().default(0),   // Current progress
  coinReward: z.number(),            // Coins awarded on completion
  xpReward: z.number(),              // XP awarded on completion
  completed: z.boolean().default(false),
  claimed: z.boolean().default(false),
  type: z.enum(['task-completion', 'quadrant-specific', 'routine-based', 'cosmetic-based', 'cleanup-based']),
  quadrant: z.enum(quadrants).optional(), // For quadrant-specific quests
});

export type DailyQuest = z.infer<typeof dailyQuestSchema>;

// Inbox Item (for unclaimed quest rewards)
export const inboxItemSchema = z.object({
  id: z.string(),           // Unique inbox item ID
  questId: z.string(),      // Original quest ID
  questName: z.string(),    // Quest name for display
  coinReward: z.number(),
  xpReward: z.number(),
  timestamp: z.string(),    // ISO date when moved to inbox
});

export type InboxItem = z.infer<typeof inboxItemSchema>;

// User profile for gamification
export const userProfileSchema = z.object({
  totalXP: z.number().default(0),
  level: z.number().default(1),
  coins: z.number().default(0), // Howie Coins - currency for the Bazaar shop
  tasksCompleted: z.number().default(0),
  doFirstTasksCompleted: z.number().default(0), // Track "Do First" quadrant completions
  hasCompletedOnboarding: z.boolean().default(false),
  selectedSprite: z.string().optional(),
  nickname: z.string().default("Howie"), // User's nickname for their avatar
  equippedCosmetics: z.object({
    hat: z.string().optional(),
    shirt: z.string().optional(),
    pants: z.string().optional(),
    cape: z.string().optional(),
    pet: z.string().optional(),
    facewear: z.string().optional(),
  }).optional(), // The entire object is optional for backward compatibility
  unlockedCosmetics: z.array(z.string()).default([]), // Array of cosmetic IDs unlocked via quests
  claimedQuests: z.array(z.string()).default([]), // Array of quest IDs that have been claimed
  dailyQuests: z.array(dailyQuestSchema).default([]), // Active daily quests
  lastDailyQuestReset: z.string().optional(), // ISO date string of last reset
  inbox: z.array(inboxItemSchema).default([]), // Unclaimed rewards from expired quests
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Bullet Journal System
export const bulletItemTypes = ["task", "event", "note"] as const;
export type BulletItemType = typeof bulletItemTypes[number];

// Temporal buckets for ADHD-friendly task organization
export const buckets = ["today", "tomorrow", "someday"] as const;
export type Bucket = typeof buckets[number];

export const bulletItemSchema = z.object({
  id: z.string(),
  type: z.enum(bulletItemTypes),
  text: z.string().min(1),
  bucket: z.enum(buckets).default("today"), // Temporal bucket instead of specific dates
  date: z.string().optional(), // Optional - only for scheduled events with specific dates
  time: z.string().optional(), // Optional time for events (HH:MM format)
  completed: z.boolean().default(false), // For tasks only
  createdAt: z.number(),
  order: z.number(), // For manual sorting within bucket
  movedToSomedayAt: z.number().optional(), // Timestamp when item was moved to Someday bucket

  // Focus Mode tracking
  focusState: z.enum(['idle', 'queued', 'active', 'completed']).default('idle').optional(),
  focusStartedAt: z.number().optional(), // Timestamp when focus session started
  focusCompletedAt: z.number().optional(), // Timestamp when focus session completed
  pomodorosCompleted: z.number().default(0).optional(), // Count of completed pomodoros
  estimatedPomodoros: z.number().optional(), // User can estimate how many pomodoros needed
});

export type BulletItem = z.infer<typeof bulletItemSchema>;
export type InsertBulletItem = Omit<BulletItem, "id" | "createdAt">;

// Legacy aliases for backwards compatibility (can be removed after migration)
export type DailySpreadItem = BulletItem;
export type DailySpreadItemType = BulletItemType;
export type InsertDailySpreadItem = InsertBulletItem;
export const dailySpreadItemTypes = bulletItemTypes;
export const dailySpreadItemSchema = bulletItemSchema;

// Focus Session System (Pomodoro Timer)
export const focusPhases = ["work", "shortBreak", "longBreak"] as const;
export type FocusPhase = typeof focusPhases[number];

export const focusSessionSchema = z.object({
  id: z.string(),
  itemId: z.string().optional(), // ID of the BulletItem being focused on (optional for standalone focus sessions)
  itemText: z.string().optional(), // Snapshot of item text at session start
  phase: z.enum(focusPhases),
  targetDuration: z.number(), // Target duration in seconds
  actualDuration: z.number().optional(), // Actual duration if finished early
  startedAt: z.number(), // Timestamp when session started
  completedAt: z.number().optional(), // Timestamp when session completed
  wasInterrupted: z.boolean().default(false), // True if user finished early or cancelled
  wasCompleted: z.boolean().default(false), // True if timer ran to completion
});

export type FocusSession = z.infer<typeof focusSessionSchema>;

// Focus Settings (Timer configuration)
export interface FocusSettings {
  workDuration: number; // In seconds (default: 25 * 60 = 1500)
  shortBreakDuration: number; // In seconds (default: 5 * 60 = 300)
  longBreakDuration: number; // In seconds (default: 15 * 60 = 900)
  longBreakInterval: number; // After how many work sessions (default: 4)
  autoStartBreaks: boolean; // Automatically start break timer after work session
  autoStartWork: boolean; // Automatically start work timer after break
  soundEnabled: boolean; // Play sound when timer completes
  notificationsEnabled: boolean; // Show browser notifications
}
