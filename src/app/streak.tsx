import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/components/ui";
import { statInputs, todaySummary } from "@/features/habits/selectors";
import { useToday } from "@/features/habits/useToday";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useT } from "@/i18n/useT";
import { dailyPhrase, phraseBand } from "@/i18n/phrases";
import { useLocale } from "@/i18n/useLocale";
import { DEFAULT_TIMEZONE, dayOfYear } from "@/lib/habit-stats";
import { useTheme } from "@/lib/useTheme";
import { addDays, startOfWeek } from "@/shared/dates";
import { dayStats, MILESTONES, streaks } from "@/shared/stats";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";

/** Sequência e frases (docs/05, tela 9). */
export default function StreakScreen() {
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const today = useToday();
  const timeZone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);

  const { current, best, week, summary } = useMemo(() => {
    const { statHabits, statLogs } = statInputs(habits, logs, timeZone);
    const s = streaks(statHabits, statLogs, today);
    const start = startOfWeek(today);
    return {
      current: s.current,
      best: s.best,
      week: Array.from({ length: 7 }, (_, i) => dayStats(statHabits, statLogs, addDays(start, i))),
      summary: todaySummary(habits, logs, today, timeZone),
    };
  }, [habits, logs, today, timeZone]);

  const phrase = dailyPhrase(locale, phraseBand(summary.done, summary.counted), dayOfYear(today));

  return (
    <SettingsShell back>
      <View style={styles.center}>
        <Text variant="streak" accessibilityLabel={`${current} ${t("streakScreen.daysInRow")}`}>
          {String(current)}
        </Text>
        <Text variant="sectionTitle" tone="mute">
          {t("streakScreen.daysInRow")}
        </Text>
        {best > 0 ? (
          <Text variant="caption" tone="mute">
            {t("streakScreen.record", { count: best })}
          </Text>
        ) : null}
      </View>

      <Card radius={24} padding={18}>
        <Text variant="caption" tone="mute" style={styles.cardLabel}>
          {t("streakScreen.thisWeek")}
        </Text>
        <View style={styles.week}>
          {week.map((d, i) => {
            const fulfilled = d.state === "fulfilled";
            return (
              <View key={d.date} style={styles.day}>
                <View
                  accessibilityLabel={`${t(`onboarding.daysNames.${i}`)}: ${fulfilled ? t("home.completed") : ""}`}
                  style={[styles.circle, fulfilled ? { backgroundColor: theme.acc } : { borderWidth: 2, borderColor: theme.line }]}
                >
                  {fulfilled ? (
                    <Text variant="captionStrong" tone="accInk">
                      ✓
                    </Text>
                  ) : null}
                </View>
                <Text variant="captionStrong" tone="mute">
                  {t(`onboarding.daysLetters.${i}`)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Text variant="sectionTitle" accessibilityRole="header">
        {t("streakScreen.next")}
      </Text>
      <View style={styles.milestones}>
        {MILESTONES.map((m) => {
          const ratio = Math.min(1, current / m);
          return (
            <View key={m} style={styles.milestone}>
              <View style={styles.milestoneHead}>
                <Text variant="bodyMedium">{t("streakScreen.milestone", { days: m })}</Text>
                <Text variant="caption" tone="mute">
                  {current >= m ? t("streakScreen.reached") : `${current}/${m}`}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.line }]}>
                <View style={[styles.fill, { backgroundColor: theme.acc, width: `${ratio * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      <Card radius={24} padding={22} style={{ backgroundColor: theme.acc }}>
        <Text variant="bodyStrong" tone="accInk" style={styles.quote}>
          {phrase}
        </Text>
      </Card>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 2 },
  cardLabel: { marginBottom: 12 },
  week: { flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", gap: 6 },
  circle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  milestones: { gap: 14 },
  milestone: { gap: 6 },
  milestoneHead: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  quote: { fontSize: 17, lineHeight: 24 },
});
