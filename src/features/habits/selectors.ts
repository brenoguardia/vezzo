import { toStatHabit, toStatLogs } from "@/lib/habit-stats";
import type { Ymd } from "@/shared/dates";
import { logKey } from "@/shared/logs";
import type { HabitDto } from "@/shared/schemas";
import { dayStats, type StatHabit, type StatLog, scheduled } from "@/shared/stats";
import type { DayLog } from "@/store/habits";

export const activeHabits = (habits: readonly HabitDto[]) =>
  habits.filter((h) => !h.archivedAt).sort((a, b) => a.order - b.order);

export type TodayItem = { habit: HabitDto; log?: DayLog };

/** Hábitos agendados para a data, na ordem do usuário, com o log do dia. */
export function todayItems(
  habits: readonly HabitDto[],
  logs: Record<string, DayLog>,
  date: Ymd,
  timeZone: string,
): TodayItem[] {
  return activeHabits(habits)
    .filter((h) => scheduled(toStatHabit(h, timeZone), date))
    .map((habit) => ({ habit, log: logs[logKey(habit.id, date)] }));
}

export function statInputs(habits: readonly HabitDto[], logs: Record<string, DayLog>, timeZone: string) {
  const statHabits: StatHabit[] = habits.map((h) => toStatHabit(h, timeZone));
  const statLogs: StatLog[] = toStatLogs(logs);
  return { statHabits, statLogs };
}

export function todaySummary(habits: readonly HabitDto[], logs: Record<string, DayLog>, date: Ymd, timeZone: string) {
  const { statHabits, statLogs } = statInputs(habits, logs, timeZone);
  return dayStats(statHabits, statLogs, date);
}
