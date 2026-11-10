import { t } from "@/i18n";
import type { GoalUnit } from "@/shared/categories";
import { formatGoal, type Locale } from "@/shared/onboarding";
import type { HabitDto } from "@/shared/schemas";

/** Título: "Hora de ler" (primeira letra do hábito em minúscula). */
export const reminderTitle = (habit: Pick<HabitDto, "name">): string =>
  t("notif.title", { habit: habit.name.charAt(0).toLowerCase() + habit.name.slice(1) });

/** Corpo motivacional com a sequência atual do hábito (docs/07). */
export function motivationalBody(
  habit: Pick<HabitDto, "goalValue" | "goalUnit">,
  name: string,
  streak: number,
  locale: Locale,
): string {
  const unit = habit.goalUnit as GoalUnit;
  if (unit === "BOOLEAN") {
    return streak > 0 ? t("notif.bodyBooleanStreak", { name, count: streak }) : t("notif.bodyBooleanStart", { name });
  }
  const goal = formatGoal(habit.goalValue, unit, locale);
  return streak > 0 ? t("notif.bodyStreak", { name, goal, count: streak }) : t("notif.bodyStart", { name, goal });
}
