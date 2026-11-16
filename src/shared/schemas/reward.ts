import { z } from "zod";
import { REWARD_MAX_DAYS, REWARD_MIN_DAYS } from "../reward";
import { emoji, ymd } from "./common";

export const REWARD_TITLE_MAX = 80;
export const DEFAULT_REWARD_EMOJI = "🎁";

/** Meta de longo prazo + presente que o usuário dá a si mesmo ao cumpri-la. */
export const rewardInput = z.object({
  title: z.string().trim().min(1).max(REWARD_TITLE_MAX),
  emoji,
  days: z.number().int().min(REWARD_MIN_DAYS).max(REWARD_MAX_DAYS),
});
export type RewardInput = z.infer<typeof rewardInput>;

export const rewardDto = rewardInput.extend({
  startDate: ymd,
  claimedAt: z.string().nullable(),
});
export type RewardDto = z.infer<typeof rewardDto>;

export const rewardProgressDto = z.object({
  state: z.enum(["ACTIVE", "ACHIEVED", "CLAIMED"]),
  currentRun: z.number(),
  daysLeft: z.number(),
  percent: z.number(),
  best: z.number(),
  attempts: z.number(),
  runStart: ymd,
  achievedDate: ymd.nullable(),
});
export type RewardProgressDto = z.infer<typeof rewardProgressDto>;
