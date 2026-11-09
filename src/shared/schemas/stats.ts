import { z } from "zod";
import { objectId } from "./common";

const week = z.object({
  start: z.string(),
  end: z.string(),
  done: z.number(),
  counted: z.number(),
  completion: z.number(),
});

export const statsDto = z.object({
  today: z.string(),
  days: z.array(
    z.object({
      date: z.string(),
      scheduled: z.number(),
      done: z.number(),
      skipped: z.number(),
      counted: z.number(),
      completion: z.number(),
      state: z.enum(["fulfilled", "missed", "neutral"]),
    }),
  ),
  currentStreak: z.number(),
  bestStreak: z.number(),
  bestDay: z.number().nullable(),
  week: z.object({ current: week, previous: week.nullable(), delta: z.number().nullable() }),
  habits: z.array(z.object({ habitId: objectId, done: z.number(), scheduled: z.number() })),
  milestones: z.array(z.object({ days: z.number(), reached: z.boolean() })),
});
export type StatsDto = z.infer<typeof statsDto>;
