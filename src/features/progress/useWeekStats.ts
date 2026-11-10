import { useMemo } from "react";
import { statInputs } from "@/features/habits/selectors";
import { useToday } from "@/features/habits/useToday";
import { periodRange } from "@/features/progress/aggregate";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { bestDay, dailyStats, habitWeekProgress, streaks, weekComparison } from "@/shared/stats";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";

/** Estatísticas da semana atual, calculadas no cliente a partir dos logs locais. */
export function useWeekStats() {
  const today = useToday();
  const timeZone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  return useMemo(() => {
    const { statHabits, statLogs } = statInputs(habits, logs, timeZone);
    const cmp = weekComparison(statHabits, statLogs, today);
    const { from, to } = periodRange("week", today);
    return {
      cmp,
      days: dailyStats(statHabits, statLogs, from, to),
      streak: streaks(statHabits, statLogs, today),
      best: bestDay(statHabits, statLogs, today),
      perHabit: habitWeekProgress(statHabits, statLogs, today),
    };
  }, [habits, logs, today, timeZone]);
}
