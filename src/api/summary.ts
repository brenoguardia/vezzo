import { apiFetch } from "@/api/client";
import { type HabitDto, habitList, type StatsDto, statsDto } from "@/shared/schemas";

/** Ativos e arquivados: o app mostra os arquivados na aba Hábitos e permite desarquivar. */
export const fetchHabits = (): Promise<HabitDto[]> =>
  apiFetch("/v1/habits?includeArchived=true", habitList).then((r) => r.habits);

export const fetchStats = (from: string, to: string): Promise<StatsDto> =>
  apiFetch(`/v1/stats?from=${from}&to=${to}`, statsDto);
