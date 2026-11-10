import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BarChart, Card, SegmentedControl, Text } from "@/components/ui";
import { useToday } from "@/features/habits/useToday";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { byMonth, completionOf, type Period } from "@/features/progress/aggregate";
import { useRemoteDays } from "@/features/progress/useRemoteDays";
import { useWeekStats } from "@/features/progress/useWeekStats";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { useTheme } from "@/lib/useTheme";
import { weekdayIndex } from "@/shared/dates";
import { useHabitsStore } from "@/store/habits";

const pct = (v: number) => `${Math.round(v * 100)}%`;
const signed = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v * 100))}%`;

/** Aba Progresso (docs/05, tela 6). Semana é calculada no cliente; mês e ano vêm da API de estatísticas. */
export default function Progress() {
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const today = useToday();
  const habits = useHabitsStore((s) => s.habits);
  const { dual } = useLayoutMode();
  const [period, setPeriod] = useState<Period>("week");
  const remote = useRemoteDays(period, today, period !== "week");
  const week = useWeekStats();

  const letters = (i: number) => t(`onboarding.daysLetters.${i}`);
  const monthLetter = (month: string) =>
    new Intl.DateTimeFormat(locale, { month: "narrow", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));

  const hasHabits = habits.some((h) => !h.archivedAt);
  const periodDays = period === "week" ? week.days : remote.days;
  const completion = period === "week" ? week.cmp.current.completion : completionOf(remote.days);
  const bestDayName = week.best === null ? "—" : t(`onboarding.daysNames.${week.best}`);
  const names = new Map(habits.map((h) => [h.id, h.name]));

  // Lado a lado (single) os cartões dividem a linha com flex; empilhados em coluna (dual) o flex os esticaria.
  const pairStyle = dual ? undefined : styles.flex;
  const bestCard = (
    <Card testID="progress-best-card" radius={20} padding={16} style={pairStyle}>
      <Text variant="caption" tone="mute">
        {t("progress.bestDay")}
      </Text>
      <Text variant="sectionTitle">{bestDayName}</Text>
    </Card>
  );
  const streakCard = (
    <Card testID="progress-streak-card" radius={20} padding={16} style={pairStyle}>
      <Text variant="caption" tone="mute">
        {t("progress.streak")}
      </Text>
      <Text variant="sectionTitle">{t("progress.streakDays", { count: week.streak.current })}</Text>
      <Text variant="caption" tone="acc">
        {t("progress.record", { count: week.streak.best })}
      </Text>
    </Card>
  );
  const chartCard = (
    <Card radius={28} padding={20} style={styles.gap}>
      <View style={styles.head}>
        <View>
          <Text variant="bodyMedium" tone="mute">
            {t("progress.completion")}
          </Text>
          <Text variant="display">{pct(completion)}</Text>
        </View>
        {period === "week" && week.cmp.delta !== null ? (
          <View style={[styles.badge, { backgroundColor: theme.line }]}>
            <Text variant="captionStrong">{t("progress.vsLastWeek", { delta: signed(week.cmp.delta) })}</Text>
          </View>
        ) : null}
      </View>

      {period === "week" ? (
        <BarChart
          accessibilityLabel={t("progress.completion")}
          data={week.days.map((d) => ({
            label: letters(weekdayIndex(d.date)),
            value: d.completion,
            highlight: d.date === today,
          }))}
        />
      ) : remote.status === "loading" ? (
        <Text tone="mute" accessibilityLiveRegion="polite">
          {t("home.loading")}
        </Text>
      ) : remote.status === "error" ? (
        <Text tone="mute">{t("common.loadError")}</Text>
      ) : period === "year" ? (
        <BarChart
          accessibilityLabel={t("progress.completion")}
          data={byMonth(remote.days).map((m) => ({
            label: monthLetter(m.month),
            value: m.completion,
            highlight: m.month === today.slice(0, 7),
          }))}
        />
      ) : (
        <View style={styles.cells}>
          {periodDays.map((d) => (
            <View
              key={d.date}
              accessibilityLabel={`${d.date}: ${pct(d.completion)}`}
              style={[
                styles.cell,
                {
                  backgroundColor: d.counted ? theme.acc : theme.line,
                  opacity: d.counted ? 0.2 + 0.8 * d.completion : 1,
                },
                d.date === today && { borderWidth: 2, borderColor: theme.ink },
              ]}
            />
          ))}
        </View>
      )}
    </Card>
  );
  const perHabit = (
    <>
      {period === "week" ? (
        <>
          <Text variant="sectionTitle" accessibilityRole="header">
            {t("progress.byHabit")}
          </Text>
          <View style={styles.list}>
            {week.perHabit
              .filter((h) => h.scheduled > 0)
              .map((h) => (
                <View key={h.habitId} style={styles.item}>
                  <View style={styles.row}>
                    <Text variant="bodyMedium">{names.get(h.habitId)}</Text>
                    <Text variant="bodyMedium" tone="mute">{`${h.done}/${h.scheduled}`}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: theme.line }]}>
                    <View
                      style={[styles.fill, { backgroundColor: theme.acc, width: `${(h.done / h.scheduled) * 100}%` }]}
                    />
                  </View>
                </View>
              ))}
          </View>
        </>
      ) : null}
    </>
  );

  const header = (
    <>
      <Text variant="screenTitle" accessibilityRole="header">
        {t("progress.title")}
      </Text>
      <SegmentedControl
        accessibilityLabel={t("progress.periodLabel")}
        value={period}
        onChange={setPeriod}
        options={[
          { value: "week", label: t("progress.week") },
          { value: "month", label: t("progress.month") },
          { value: "year", label: t("progress.year") },
        ]}
      />
    </>
  );

  const empty = (
    <Card radius={24} padding={22} style={styles.gap}>
      <Text variant="bodyStrong">{t("progress.empty")}</Text>
      <Text tone="mute">{t("progress.emptySub")}</Text>
    </Card>
  );

  // Dual (docs/08): esquerda gráfico e melhor dia; direita sequência e por hábito.
  if (dual && hasHabits) {
    return (
      <SettingsShell
        aside={
          <>
            {streakCard}
            {perHabit}
          </>
        }
      >
        {header}
        {chartCard}
        {bestCard}
      </SettingsShell>
    );
  }

  return (
    <SettingsShell>
      {header}
      {!hasHabits ? (
        empty
      ) : (
        <>
          {chartCard}
          <View style={styles.pair}>
            {bestCard}
            {streakCard}
          </View>
          {perHabit}
        </>
      )}
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 12 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  pair: { flexDirection: "row", gap: 12 },
  cells: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: { width: 34, height: 34, borderRadius: 8 },
  list: { gap: 14 },
  item: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});
