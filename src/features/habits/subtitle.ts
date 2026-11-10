import { t } from "@/i18n";
import { formatClock } from "@/lib/format";
import type { GoalUnit } from "@/shared/categories";
import { formatGoal, type Locale } from "@/shared/onboarding";
import type { HabitDto } from "@/shared/schemas";
import type { DayLog } from "@/store/habits";

const plain = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);

/** Linha de apoio do cartão do hábito: progresso, "concluído 07:30" ou "pulado". */
export function habitSubtitle(habit: HabitDto, log: DayLog | undefined, locale: Locale, timeZone: string): string {
  const unit = habit.goalUnit as GoalUnit;
  if (log?.status === "SKIPPED") return t("home.skipped");
  if (log?.status === "DONE") {
    const clock = log.completedAt ? formatClock(log.completedAt, timeZone, locale) : null;
    if (unit === "BOOLEAN") return clock ? `${t("home.completed")} ${clock}` : t("home.completed");
    const goal = formatGoal(habit.goalValue, unit, locale);
    return clock ? `${goal} · ${t("home.completedAt", { time: clock })}` : goal;
  }
  if (unit === "BOOLEAN") return t("onboarding.daily");
  return `${plain(log?.value ?? 0, locale)} / ${formatGoal(habit.goalValue, unit, locale)}`;
}
