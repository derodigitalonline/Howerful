import { z } from "zod";

export const quadrants = ["do-first", "schedule", "delegate", "eliminate"] as const;
export type Quadrant = typeof quadrants[number];

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
  quadrant: z.enum(quadrants),
  createdAt: z.number(),
  completed: z.boolean().default(false),
  completedInQuadrant: z.enum(quadrants).optional(), // Track which quadrant task was completed in
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = Omit<Task, "id" | "createdAt">;

// User profile for gamification
export const userProfileSchema = z.object({
  totalXP: z.number().default(0),
  level: z.number().default(1),
  tasksCompleted: z.number().default(0),
  hasCompletedOnboarding: z.boolean().default(false),
  selectedSprite: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
