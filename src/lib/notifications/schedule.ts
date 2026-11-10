// Lógica pura de agendamento (docs/07). Sem expo-notifications aqui: testável em qualquer ambiente.
import type { Ymd } from "@/shared/dates";
import { diffDays, weekdayIndex } from "@/shared/dates";
import type { HabitDto } from "@/shared/schemas";

/** iOS mantém no máximo 64 notificações locais pendentes. */
export const IOS_PENDING_LIMIT = 64;
/** Nunca mais de 8 lembretes por dia (docs/07, "Texto das notificações"). */
export const MAX_PER_DAY = 8;
export const SNOOZE_LIMIT_PER_DAY = 3;
export const SNOOZE_SECONDS = 60 * 60;

/** Nosso modelo: 0 = segunda … 6 = domingo. Expo: 1 = domingo, 2 = segunda … 7 = sábado. */
export const toExpoWeekday = (day: number): number => ((day + 1) % 7) + 1;

export type PlannedReminder = {
  habitId: string;
  time: string;
  hour: number;
  minute: number;
  /** Dia do nosso modelo (0 = segunda). */
  day: number;
  /** Dia do Expo (1 = domingo). */
  weekday: number;
  quickActions: boolean;
};

const parseTime = (time: string): [number, number] => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return [h, m];
};

/** Minutos até a próxima ocorrência a partir de `now` (data local + minuto do dia). Domingo→segunda circular. */
export function minutesUntil(plan: Pick<PlannedReminder, "day" | "hour" | "minute">, today: Ymd, nowMinute: number): number {
  const target = plan.hour * 60 + plan.minute;
  let dayDelta = (plan.day - weekdayIndex(today) + 7) % 7;
  if (dayDelta === 0 && target <= nowMinute) dayDelta = 7;
  return dayDelta * 1440 + target - nowMinute;
}

/**
 * Um gatilho semanal por hábito ativo × horário × dia agendado. Aplica o teto de 8 por dia
 * (mantém os mais cedo) e, passando de `limit` pendentes, prioriza os próximos horários.
 */
export function planReminders(
  habits: readonly HabitDto[],
  now: { today: Ymd; minute: number },
  limit: number = IOS_PENDING_LIMIT,
): PlannedReminder[] {
  const all: PlannedReminder[] = [];
  for (const habit of [...habits].sort((a, b) => a.order - b.order)) {
    if (habit.archivedAt) continue;
    for (const time of new Set(habit.reminders)) {
      const [hour, minute] = parseTime(time);
      for (const day of new Set(habit.days)) {
        all.push({ habitId: habit.id, time, hour, minute, day, weekday: toExpoWeekday(day), quickActions: habit.quickActions });
      }
    }
  }

  const perDay = new Map<number, PlannedReminder[]>();
  for (const plan of all) perDay.set(plan.day, [...(perDay.get(plan.day) ?? []), plan]);
  const capped = [...perDay.values()].flatMap((list) =>
    [...list].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)).slice(0, MAX_PER_DAY),
  );

  if (capped.length <= limit) return capped;
  return capped
    .map((plan) => ({ plan, wait: minutesUntil(plan, now.today, now.minute) }))
    .sort((a, b) => a.wait - b.wait)
    .slice(0, limit)
    .map((x) => x.plan);
}

/** Contagem de adiamentos de um dia; outro dia recomeça do zero. */
export type SnoozeCounts = Record<string, { date: Ymd; count: number }>;

export function snoozesToday(counts: SnoozeCounts, habitId: string, date: Ymd): number {
  const entry = counts[habitId];
  return entry && entry.date === date ? entry.count : 0;
}

export const canSnooze = (counts: SnoozeCounts, habitId: string, date: Ymd): boolean =>
  snoozesToday(counts, habitId, date) < SNOOZE_LIMIT_PER_DAY;

export function registerSnooze(counts: SnoozeCounts, habitId: string, date: Ymd): SnoozeCounts {
  return { ...counts, [habitId]: { date, count: snoozesToday(counts, habitId, date) + 1 } };
}

/** Remove contagens de dias antigos para o mapa não crescer para sempre. */
export function pruneSnoozes(counts: SnoozeCounts, today: Ymd): SnoozeCounts {
  return Object.fromEntries(Object.entries(counts).filter(([, v]) => diffDays(v.date, today) <= 1));
}
