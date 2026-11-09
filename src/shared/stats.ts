// Estatísticas puras (docs/03). Sem acesso a banco nem a relógio.
import { addDays, eachDay, startOfWeek, weekdayIndex, type Ymd } from "./dates";
import type { LogStatus } from "./logs";

export type StatHabit = {
  id: string;
  days: readonly number[];
  /** Data local de criação. */
  createdAt: Ymd;
  /** Data local a partir da qual o hábito deixa de ser agendado. */
  archivedOn?: Ymd | null;
};
export type StatLog = { habitId: string; date: Ymd; status: LogStatus };

export type DayState = "fulfilled" | "missed" | "neutral";
export type DayStats = {
  date: Ymd;
  scheduled: number;
  done: number;
  skipped: number;
  /** agendados - pulados: o denominador da conclusão. */
  counted: number;
  completion: number;
  state: DayState;
};

export const MILESTONES = [15, 30, 100] as const;

type LogIndex = Map<string, LogStatus>;
const key = (habitId: string, date: Ymd) => `${habitId}|${date}`;

function index(logs: readonly StatLog[]): LogIndex {
  return new Map(logs.map((l) => [key(l.habitId, l.date), l.status]));
}

export function scheduled(habit: StatHabit, date: Ymd): boolean {
  if (date < habit.createdAt) return false;
  if (habit.archivedOn && date >= habit.archivedOn) return false;
  return habit.days.includes(weekdayIndex(date));
}

function dayStatsIdx(habits: readonly StatHabit[], idx: LogIndex, date: Ymd): DayStats {
  let sched = 0;
  let done = 0;
  let skipped = 0;
  for (const habit of habits) {
    if (!scheduled(habit, date)) continue;
    sched += 1;
    const status = idx.get(key(habit.id, date));
    if (status === "DONE") done += 1;
    else if (status === "SKIPPED") skipped += 1;
  }
  const counted = sched - skipped;
  const state: DayState = counted === 0 ? "neutral" : done === counted ? "fulfilled" : "missed";
  return { date, scheduled: sched, done, skipped, counted, completion: counted ? done / counted : 0, state };
}

export function dayStats(habits: readonly StatHabit[], logs: readonly StatLog[], date: Ymd): DayStats {
  return dayStatsIdx(habits, index(logs), date);
}

export function dailyStats(
  habits: readonly StatHabit[],
  logs: readonly StatLog[],
  from: Ymd,
  to: Ymd,
): DayStats[] {
  const idx = index(logs);
  return eachDay(from, to).map((date) => dayStatsIdx(habits, idx, date));
}

function earliest(habits: readonly StatHabit[]): Ymd | null {
  return habits.reduce<Ymd | null>((min, h) => (min === null || h.createdAt < min ? h.createdAt : min), null);
}

/**
 * Percorre do primeiro hábito até hoje. Dia neutro não quebra nem soma;
 * hoje pendente não quebra (a contagem segue de ontem).
 */
export function streaks(
  habits: readonly StatHabit[],
  logs: readonly StatLog[],
  today: Ymd,
): { current: number; best: number } {
  const start = earliest(habits);
  if (start === null) return { current: 0, best: 0 };
  const idx = index(logs);
  let run = 0;
  let best = 0;
  for (const date of eachDay(start, today)) {
    const { state } = dayStatsIdx(habits, idx, date);
    if (state === "fulfilled") {
      run += 1;
      best = Math.max(best, run);
    } else if (state === "missed" && date !== today) {
      run = 0;
    }
  }
  return { current: run, best };
}

export const currentStreak = (h: readonly StatHabit[], l: readonly StatLog[], today: Ymd) =>
  streaks(h, l, today).current;
export const bestStreak = (h: readonly StatHabit[], l: readonly StatLog[], today: Ymd) =>
  streaks(h, l, today).best;

export type WeekCompletion = { start: Ymd; end: Ymd; done: number; counted: number; completion: number };

/** Média ponderada pelos hábitos agendados nos 7 dias (segunda a domingo). */
export function weekCompletion(
  habits: readonly StatHabit[],
  logs: readonly StatLog[],
  anyDateInWeek: Ymd,
): WeekCompletion {
  const start = startOfWeek(anyDateInWeek);
  const end = addDays(start, 6);
  const days = dailyStats(habits, logs, start, end);
  const done = days.reduce((n, d) => n + d.done, 0);
  const counted = days.reduce((n, d) => n + d.counted, 0);
  return { start, end, done, counted, completion: counted ? done / counted : 0 };
}

export function weekComparison(
  habits: readonly StatHabit[],
  logs: readonly StatLog[],
  anyDateInWeek: Ymd,
): { current: WeekCompletion; previous: WeekCompletion | null; delta: number | null } {
  const current = weekCompletion(habits, logs, anyDateInWeek);
  const prev = weekCompletion(habits, logs, addDays(current.start, -7));
  const previous = prev.counted > 0 ? prev : null;
  return { current, previous, delta: previous ? current.completion - previous.completion : null };
}

export function habitWeekProgress(
  habits: readonly StatHabit[],
  logs: readonly StatLog[],
  anyDateInWeek: Ymd,
): { habitId: string; done: number; scheduled: number }[] {
  const idx = index(logs);
  const week = eachDay(startOfWeek(anyDateInWeek), addDays(startOfWeek(anyDateInWeek), 6));
  return habits.map((habit) => {
    const days = week.filter((d) => scheduled(habit, d));
    return {
      habitId: habit.id,
      scheduled: days.length,
      done: days.filter((d) => idx.get(key(habit.id, d)) === "DONE").length,
    };
  });
}

/** Dia da semana (0=segunda) com maior média de conclusão; null sem histórico. */
export function bestDay(habits: readonly StatHabit[], logs: readonly StatLog[], today: Ymd): number | null {
  const start = earliest(habits);
  if (start === null) return null;
  const sums = new Array<number>(7).fill(0);
  const counts = new Array<number>(7).fill(0);
  for (const d of dailyStats(habits, logs, start, today)) {
    if (d.counted === 0) continue;
    const w = weekdayIndex(d.date);
    sums[w] += d.completion;
    counts[w] += 1;
  }
  let best: number | null = null;
  let bestAvg = -1;
  for (let w = 0; w < 7; w++) {
    if (!counts[w]) continue;
    const avg = sums[w] / counts[w];
    if (avg > bestAvg) {
      bestAvg = avg;
      best = w;
    }
  }
  return best;
}

export function milestones(streak: number): { days: number; reached: boolean }[] {
  return MILESTONES.map((days) => ({ days, reached: streak >= days }));
}
