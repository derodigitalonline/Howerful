import { z } from "zod";

export const quadrants = ["do-first", "schedule", "delegate", "eliminate"] as const;
export type Quadrant = typeof quadrants[number];

export const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  quadrant: z.enum(quadrants),
  createdAt: z.number(),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = Omit<Task, "id" | "createdAt">;
