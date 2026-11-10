import { t } from "@/i18n";
import type { GoalUnit } from "@/shared/categories";
import { addDays, startOfWeek, type Ymd } from "@/shared/dates";
import { formatGoal, type Locale, stepSize } from "@/shared/onboarding";
import type { DayLog } from "@/store/habits";

export type QuickAmount = { delta: number; label: string };

/** Botões de adição rápida do detalhe: um e dois passos da unidade (água em ml, como no design). */
export function quickAmounts(unit: GoalUnit, locale: Locale): QuickAmount[] {
  const step = stepSize(unit);
  if (step === null) return [];
  return [step, step * 2].map((delta) => {
    const text = unit === "LITERS" ? formatGoal(delta * 1000, "MILLILITERS", locale) : formatGoal(delta, unit, locale);
    return { delta, label: t("habit.addAmount", { amount: text }) };
  });
}

/** Opacidade da célula da grade de 4 semanas: 1 cumprido, 0,6 parcial, 0,3 quase, 0,15 não feito. */
export function cellOpacity(goalValue: number, unit: GoalUnit, log?: DayLog): number {
  if (!log || log.status === "SKIPPED") return 0.15;
  if (log.status === "DONE") return 1;
  const target = unit === "BOOLEAN" ? 1 : goalValue;
  const ratio = log.value / target;
  if (ratio >= 0.5) return 0.6;
  if (ratio > 0) return 0.3;
  return 0.15;
}

/** 28 datas (4 semanas, segunda a domingo) terminando na semana de `today`. */
export function lastFourWeeks(today: Ymd): Ymd[][] {
  const first = addDays(startOfWeek(today), -21);
  return Array.from({ length: 4 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)));
}
