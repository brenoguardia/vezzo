// Datas de hábito são strings locais "YYYY-MM-DD" (CLAUDE.md regra 9).
// A aritmética usa UTC apenas como calendário puro, sem relação com o fuso do usuário.

export type Ymd = string;

function toUtc(date: Ymd): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): Ymd {
  return new Date(ms).toISOString().slice(0, 10);
}

const DAY_MS = 86_400_000;

/** 0 = segunda ... 6 = domingo. */
export function weekdayIndex(date: Ymd): number {
  return (new Date(toUtc(date)).getUTCDay() + 6) % 7;
}

export function addDays(date: Ymd, amount: number): Ymd {
  return fromUtc(toUtc(date) + amount * DAY_MS);
}

export function diffDays(from: Ymd, to: Ymd): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export function startOfWeek(date: Ymd): Ymd {
  return addDays(date, -weekdayIndex(date));
}

/** Datas do intervalo, inclusivas. Vazio se `from > to`. */
export function eachDay(from: Ymd, to: Ymd): Ymd[] {
  const total = diffDays(from, to);
  return Array.from({ length: Math.max(total + 1, 0) }, (_, i) => addDays(from, i));
}

/** Data local (YYYY-MM-DD) de um instante no fuso IANA informado. */
export function localDate(instant: Date, timeZone: string): Ymd {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}
