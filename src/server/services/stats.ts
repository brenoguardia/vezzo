import type { Db } from "@/server/db";
import { timezoneOf } from "@/server/services/profile";
import { localDate } from "@/shared/dates";
import type { StatsDto } from "@/shared/schemas";
import {
  bestDay,
  dailyStats,
  habitWeekProgress,
  milestones,
  type StatHabit,
  type StatLog,
  streaks,
  weekComparison,
} from "@/shared/stats";

export async function getStats(db: Db, userId: string, from: string, to: string, now = new Date()): Promise<StatsDto> {
  const timeZone = await timezoneOf(db, userId);
  const today = localDate(now, timeZone);
  const [rows, logRows] = await Promise.all([
    db.habit.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    db.habitLog.findMany({ where: { userId } }),
  ]);

  // Hábitos arquivados continuam contando no histórico até o dia do arquivamento.
  const habits: StatHabit[] = rows.map((h) => ({
    id: h.id,
    days: h.days,
    createdAt: localDate(h.createdAt, timeZone),
    archivedOn: h.archivedAt ? localDate(h.archivedAt, timeZone) : null,
  }));
  const logs: StatLog[] = logRows.map((l) => ({ habitId: l.habitId, date: l.date, status: l.status }));
  const active = habits.filter((h) => !h.archivedOn);
  const { current, best } = streaks(habits, logs, today);

  return {
    today,
    days: dailyStats(habits, logs, from, to),
    currentStreak: current,
    bestStreak: best,
    bestDay: bestDay(habits, logs, today),
    week: weekComparison(habits, logs, to),
    habits: habitWeekProgress(active, logs, to),
    milestones: milestones(current),
  };
}
