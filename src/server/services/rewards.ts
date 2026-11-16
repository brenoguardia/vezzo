import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { findOwnedHabit } from "@/server/services/habits";
import { timezoneOf } from "@/server/services/profile";
import { localDate } from "@/shared/dates";
import { type RewardProgress, rewardProgress } from "@/shared/reward";

async function progressOf(db: Db, userId: string, id: string, now: Date): Promise<RewardProgress> {
  const habit = await findOwnedHabit(db, userId, id);
  if (!habit.rewardDays || !habit.rewardStartDate) throw new ApiError("NOT_FOUND", "Este hábito não tem presente.");
  const timeZone = await timezoneOf(db, userId);
  const logs = await db.habitLog.findMany({
    where: { habitId: habit.id, userId, date: { gte: habit.rewardStartDate } },
  });
  return rewardProgress(
    {
      id: habit.id,
      days: habit.days,
      createdAt: localDate(habit.createdAt, timeZone),
      archivedOn: habit.archivedAt ? localDate(habit.archivedAt, timeZone) : null,
      rewardDays: habit.rewardDays,
      rewardStartDate: habit.rewardStartDate,
      rewardClaimedAt: habit.rewardClaimedAt ? habit.rewardClaimedAt.toISOString() : null,
    },
    logs.map((l) => ({ habitId: l.habitId, date: l.date, status: l.status })),
    localDate(now, timeZone),
  );
}

export const getRewardProgress = (db: Db, userId: string, id: string, now = new Date()) =>
  progressOf(db, userId, id, now);

/** Marca o presente como resgatado. Só é possível depois de conquistado; repetir é idempotente. */
export async function claimReward(db: Db, userId: string, id: string, now = new Date()): Promise<RewardProgress> {
  const progress = await progressOf(db, userId, id, now);
  if (progress.state === "ACTIVE") throw new ApiError("CONFLICT", "A meta ainda não foi concluída.");
  if (progress.state === "ACHIEVED") {
    await db.habit.update({ where: { id, userId }, data: { rewardClaimedAt: now } });
    return { ...progress, state: "CLAIMED" };
  }
  return progress;
}
