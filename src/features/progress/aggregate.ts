import { addDays, startOfWeek, type Ymd } from "@/shared/dates";
import type { DayStats } from "@/shared/stats";

export type Period = "week" | "month" | "year";

/** Intervalo inclusivo do período que contém `today`. Mês = mês do calendário; ano = últimos 12 meses fechando no mês atual. */
export function periodRange(period: Period, today: Ymd): { from: Ymd; to: Ymd } {
  if (period === "week") {
    const from = startOfWeek(today);
    return { from, to: addDays(from, 6) };
  }
  const [y = 0, m = 1] = today.split("-").map(Number);
  if (period === "month") {
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const mm = String(m).padStart(2, "0");
    return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, "0")}` };
  }
  const start = new Date(Date.UTC(y, m - 12, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

/** Conclusão média ponderada (done / counted) de uma lista de dias; 0 sem dias contáveis. */
export function completionOf(days: readonly Pick<DayStats, "done" | "counted">[]): number {
  const done = days.reduce((n, d) => n + d.done, 0);
  const counted = days.reduce((n, d) => n + d.counted, 0);
  return counted ? done / counted : 0;
}

export type MonthBar = { month: string; completion: number; counted: number };

/** Agrupa dias por mês ("YYYY-MM"), na ordem cronológica. */
export function byMonth(days: readonly DayStats[]): MonthBar[] {
  const groups = new Map<string, DayStats[]>();
  for (const d of days) {
    const key = d.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, list]) => ({
      month,
      completion: completionOf(list),
      counted: list.reduce((n, d) => n + d.counted, 0),
    }));
}
