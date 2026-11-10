import { apiFetch } from "@/api/client";
import { type HabitDto, habitList, type StatsDto, statsDto } from "@/shared/schemas";

export const fetchHabits = (): Promise<HabitDto[]> => apiFetch("/v1/habits", habitList).then((r) => r.habits);

export const fetchStats = (from: string, to: string): Promise<StatsDto> =>
  apiFetch(`/v1/stats?from=${from}&to=${to}`, statsDto);
