import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, EmojiTile, HabitDetailSkeleton, Text } from "@/components/ui";
import { cellOpacity, lastFourWeeks, quickAmounts } from "@/features/habits/detail";
import { useHydrating } from "@/features/habits/SyncStatus";
import { statInputs } from "@/features/habits/selectors";
import { useToday } from "@/features/habits/useToday";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { useTheme } from "@/lib/useTheme";
import type { GoalUnit } from "@/shared/categories";
import { logKey } from "@/shared/logs";
import { formatGoal } from "@/shared/onboarding";
import { currentStreak } from "@/shared/stats";
import { layout } from "@/shared/tokens";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";

/** Detalhe do hábito (docs/05, tela 7): progresso do dia, adição rápida, 4 semanas, sequência e lembretes. */
export function HabitDetailView({ id }: { id: string | undefined }) {
  const t = useT();
  const router = useRouter();
  const theme = useTheme();
  const locale = useLocale();
  const today = useToday();
  const timeZone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  const habit = useHabitsStore((s) => s.habits.find((h) => h.id === id));
  const logs = useHabitsStore((s) => s.logs);
  const hydrating = useHydrating();
  const { addValue, toggleDone, skip } = useHabitsStore.getState();

  const streak = useMemo(() => {
    if (!habit) return 0;
    const { statHabits, statLogs } = statInputs([habit], logs, timeZone);
    return currentStreak(
      statHabits,
      statLogs.filter((l) => l.habitId === habit.id),
      today,
    );
  }, [habit, logs, today, timeZone]);

  if (!habit) {
    // Antes de hidratar, "não encontrado" seria enganoso: o hábito pode só não ter chegado.
    return hydrating ? <HabitDetailSkeleton /> : <Text tone="mute">{t("habit.notFound")}</Text>;
  }

  const unit = habit.goalUnit as GoalUnit;
  const log = logs[logKey(habit.id, today)];
  const value = log?.value ?? 0;
  const numeric = unit !== "BOOLEAN";
  const ratio = Math.min(1, habit.goalValue ? value / habit.goalValue : 0);
  const done = log?.status === "DONE";
  const amounts = quickAmounts(unit, locale);

  return (
    <>
      <View style={styles.titleRow}>
        <EmojiTile emoji={habit.emoji} size={56} />
        <View style={styles.flex}>
          <Text variant="screenTitle" accessibilityRole="header" numberOfLines={2}>
            {habit.name}
          </Text>
          <Text variant="caption" tone="mute">
            {numeric ? formatGoal(habit.goalValue, unit, locale) : t("onboarding.daily")}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/habit/[id]/edit", params: { id: habit.id } })}
          style={styles.edit}
        >
          <Text variant="bodyStrong" tone="acc">
            {t("habit.edit")}
          </Text>
        </Pressable>
      </View>

      <Card radius={28} padding={22} style={styles.progress}>
        {numeric ? (
          <>
            <Text
              style={styles.big}
              accessibilityLabel={`${formatGoal(value, unit, locale)} / ${formatGoal(habit.goalValue, unit, locale)}`}
            >
              {`${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} / ${formatGoal(habit.goalValue, unit, locale)}`}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
              style={[styles.track, { backgroundColor: theme.line }]}
            >
              <View style={[styles.fill, { backgroundColor: theme.acc, width: `${ratio * 100}%` }]} />
            </View>
            <View style={styles.quick}>
              {amounts.map((a, i) => (
                <Button
                  key={a.delta}
                  label={a.label}
                  variant={i === amounts.length - 1 ? "primary" : "secondary"}
                  onPress={() => addValue(habit.id, today, a.delta)}
                  style={[styles.flex, i === 0 && { backgroundColor: theme.line, borderWidth: 0 }]}
                />
              ))}
            </View>
          </>
        ) : null}
        <View style={styles.quick}>
          <Button
            label={done ? t("habit.undo") : t("habit.markDone")}
            onPress={() => toggleDone(habit.id, today)}
            style={styles.flex}
          />
          <Button
            label={t("habit.skip")}
            variant="secondary"
            onPress={() => skip(habit.id, today)}
            style={styles.flex}
          />
        </View>
      </Card>

      <Text variant="sectionTitle" accessibilityRole="header">
        {t("habit.last4weeks")}
      </Text>
      <View style={styles.grid}>
        {lastFourWeeks(today).map((week) => (
          <View key={week[0]} style={styles.gridRow}>
            {week.map((date) => (
              <View
                key={date}
                style={[
                  styles.cell,
                  {
                    backgroundColor: theme.acc,
                    opacity: cellOpacity(habit.goalValue, unit, logs[logKey(habit.id, date)]),
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.quick}>
        <Card radius={20} padding={16} style={styles.flex}>
          <Text variant="caption" tone="mute">
            {t("habit.streak")}
          </Text>
          <Text variant="sectionTitle">{t("progress.streakDays", { count: streak })}</Text>
        </Card>
        <Card radius={20} padding={16} style={styles.flex}>
          <Text variant="caption" tone="mute">
            {t("habit.reminders")}
          </Text>
          <Text variant="sectionTitle">
            {habit.reminders.length ? habit.reminders.join(" · ") : t("habit.noReminders")}
          </Text>
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  edit: { minHeight: layout.minTouch, justifyContent: "center", paddingLeft: 8 },
  progress: { gap: 16 },
  big: { fontFamily: "Manrope_800ExtraBold", fontSize: 40, lineHeight: 48, letterSpacing: -1 },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5 },
  quick: { flexDirection: "row", gap: 10 },
  grid: { gap: 6 },
  gridRow: { flexDirection: "row", gap: 6 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 8 },
});
