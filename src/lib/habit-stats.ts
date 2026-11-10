import { diffDays, localDate, type Ymd } from "@/shared/dates";
import type { HabitDto } from "@/shared/schemas";
import type { StatHabit, StatLog } from "@/shared/stats";
import type { DayLog } from "@/store/habits";

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** Adapta o DTO para as funções puras de `shared/stats`, com datas locais do usuário. */
export function toStatHabit(habit: HabitDto, timeZone: string): StatHabit {
  return {
    id: habit.id,
    days: habit.days,
    createdAt: localDate(new Date(habit.createdAt), timeZone),
    archivedOn: habit.archivedAt ? localDate(new Date(habit.archivedAt), timeZone) : null,
  };
}

export function toStatLogs(logs: Record<string, DayLog>): StatLog[] {
  return Object.entries(logs).map(([key, log]) => {
    const [habitId = "", date = ""] = key.split(":");
    return { habitId, date, status: log.status };
  });
}

/** Dia do ano (1–366) de uma data local; base da frase do dia. */
export const dayOfYear = (date: Ymd): number => diffDays(`${date.slice(0, 4)}-01-01`, date) + 1;
