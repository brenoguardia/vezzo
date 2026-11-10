import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { fetchHabits, fetchStats } from "@/api/summary";
import { addDays, localDate, startOfWeek } from "@/shared/dates";

export interface ProfileSummary {
  streak: number;
  habits: number;
  /** 0–1: conclusão da semana corrente. */
  completion: number;
}

/** Métricas do perfil (sequência, hábitos ativos, conclusão da semana). `null` enquanto carrega ou offline. */
export function useProfileSummary(timezone: string | undefined): ProfileSummary | null {
  const [summary, setSummary] = useState<ProfileSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const today = localDate(new Date(), timezone ?? "America/Sao_Paulo");
      const from = startOfWeek(today);
      Promise.all([fetchHabits(), fetchStats(from, addDays(from, 6))])
        .then(([habits, stats]) => {
          if (!cancelled) {
            setSummary({ streak: stats.currentStreak, habits: habits.length, completion: stats.week.current.completion });
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [timezone]),
  );

  return summary;
}
