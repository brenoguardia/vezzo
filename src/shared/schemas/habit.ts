import { z } from "zod";
import { emoji, goalUnit, hhmm, objectId } from "./common";
import { rewardDto, rewardInput } from "./reward";

const habitFields = z.object({
  name: z.string().trim().min(1).max(40),
  emoji,
  goalValue: z.number().positive(),
  goalUnit,
  days: z.array(z.number().int().min(0).max(6)).min(1),
  reminders: z.array(hhmm).max(5),
  quickActions: z.boolean(),
});

export const habitInput = habitFields.extend({
  templateSlug: z.string().optional(),
  reminders: habitFields.shape.reminders.default([]),
  quickActions: habitFields.shape.quickActions.default(true),
});
export type HabitInput = z.infer<typeof habitInput>;

/** Criação avulsa (POST e formulário): o onboarding continua usando `habitInput`, sem presente. */
export const habitCreate = habitInput.extend({ reward: rewardInput.nullish() });
export type HabitCreate = z.infer<typeof habitCreate>;

/** PATCH: sem defaults, para não sobrescrever campos ausentes. */
export const habitPatch = habitFields
  .partial()
  // `archived: false` desarquiva; `true` arquiva (equivale ao DELETE sem `hard`).
  // `reward: null` remove o presente.
  .extend({ archived: z.boolean().optional(), reward: rewardInput.nullable().optional() })
  .refine((v) => Object.keys(v).length > 0, "Informe ao menos um campo");

export const habitListQuery = z.object({
  includeArchived: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const habitDeleteQuery = z.object({
  hard: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const habitDto = z.object({
  id: objectId,
  templateId: objectId.nullable(),
  name: z.string(),
  emoji: z.string(),
  goalValue: z.number(),
  goalUnit,
  days: z.array(z.number()),
  reminders: z.array(z.string()),
  quickActions: z.boolean(),
  order: z.number(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  reward: rewardDto.nullable().optional(),
});
export type HabitDto = z.infer<typeof habitDto>;
export const habitList = z.object({ habits: z.array(habitDto) });
