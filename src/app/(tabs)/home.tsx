import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Ring, Text } from "@/components/ui";
import { HabitDetailView } from "@/features/habits/HabitDetailView";
import { HabitRow } from "@/features/habits/HabitRow";
import { statInputs, todayItems, todaySummary } from "@/features/habits/selectors";
import { habitSubtitle } from "@/features/habits/subtitle";
import { useToday } from "@/features/habits/useToday";
import { WeekChartCard } from "@/features/progress/WeekChartCard";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useT } from "@/i18n/useT";
import { useLocale } from "@/i18n/useLocale";
import { dailyPhrase, phraseBand } from "@/i18n/phrases";
import { DEFAULT_TIMEZONE, dayOfYear } from "@/lib/habit-stats";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { currentStreak } from "@/shared/stats";
import { hydrateHabits } from "@/features/habits/hydrate";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useProfileStore } from "@/store/profile";
import { useSyncStore } from "@/store/sync";

/** Aba Hoje (docs/05, tela 5): resumo do dia, frase motivacional e lista de hábitos agendados. */
export default function Today() {
  const t = useT();
  const router = useRouter();
  const locale = useLocale();
  const today = useToday();
  const name = useProfileStore((s) => s.profile?.displayName ?? "");
  const timeZone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const toggleDone = useHabitsStore((s) => s.toggleDone);
  const selectHabit = useHabitsStore((s) => s.selectHabit);
  const selectedId = useHabitsStore((s) => s.selectedHabitId);
  const { dual } = useLayoutMode();
  const hydration = useHydrationStore((s) => s.status);
  const pendingSync = useSyncStore((s) => s.queue.length > 0);
  const syncFailed = useSyncStore((s) => s.failed);

  const items = useMemo(() => todayItems(habits, logs, today, timeZone), [habits, logs, today, timeZone]);
  const summary = useMemo(() => todaySummary(habits, logs, today, timeZone), [habits, logs, today, timeZone]);
  const streak = useMemo(() => {
    const { statHabits, statLogs } = statInputs(habits, logs, timeZone);
    return currentStreak(statHabits, statLogs, today);
  }, [habits, logs, today, timeZone]);

  const phrase = dailyPhrase(locale, phraseBand(summary.done, summary.counted), dayOfYear(today));
  const hasHabits = habits.some((h) => !h.archivedAt);
  // Primeira carga sem cache: skeleton em vez do estado vazio, que seria enganoso.
  const loadingFirst = habits.length === 0 && (hydration === "loading" || hydration === "idle");

  const selected = dual && selectedId ? items.find((i) => i.habit.id === selectedId)?.habit : undefined;

  return (
    <SettingsShell aside={selected ? <HabitDetailView id={selected.id} /> : <WeekChartCard />}>
      <View style={styles.header}>
        <Text variant="bodyMedium" tone="mute">
          {t("home.today")}
        </Text>
        <Text variant="screenTitle" accessibilityRole="header">
          {t("home.hello", { name })}
        </Text>
      </View>

      {pendingSync ? (
        <Text variant="caption" tone="mute" accessibilityLiveRegion="polite">
          {t(syncFailed ? "home.syncPending" : "home.syncing")}
        </Text>
      ) : null}

      {hydration === "error" ? (
        <View accessibilityLiveRegion="polite">
        <Card radius={16} padding={12} style={styles.banner}>
          <Text variant="caption" tone="mute" style={styles.flex}>
            {t("home.offline")}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => void hydrateHabits(timeZone)} style={styles.retry}>
            <Text variant="captionStrong" tone="acc">
              {t("common.retry")}
            </Text>
          </Pressable>
        </Card>
        </View>
      ) : null}

      {loadingFirst ? (
        <View accessibilityRole="progressbar" accessibilityLabel={t("home.loading")} style={styles.list}>
          <Card radius={28} padding={20} style={styles.skeletonSummary}>
            {null}
          </Card>
          {[0, 1, 2].map((i) => (
            <Card key={i} radius={20} padding={0} style={styles.skeletonRow}>
              {null}
            </Card>
          ))}
        </View>
      ) : !hasHabits ? (
        <Card radius={28} padding={28} style={styles.empty}>
          <Text style={styles.seed}>🌱</Text>
          <Text variant="sectionTitle">{t("home.emptyTitle")}</Text>
          <Text tone="mute" style={styles.center}>
            {t("home.emptySub")}
          </Text>
          <Button label={t("home.createHabit")} onPress={() => router.push("/habit/new")} />
        </Card>
      ) : (
        <>
          <Card
            radius={28}
            padding={20}
            onPress={() => router.push("/streak")}
            accessibilityLabel={`${t("home.summary", { done: summary.done, total: summary.counted })}. ${phrase}`}
            style={styles.summary}
          >
            <Ring progress={summary.counted ? summary.done / summary.counted : 0} size={112} strokeWidth={11}>
              <Text style={styles.ratio}>{`${summary.done}/${summary.counted}`}</Text>
              <Text variant="caption" tone="mute">
                {t("home.done")}
              </Text>
            </Ring>
            <View style={styles.phrase}>
              <Text variant="bodyMedium">{phrase}</Text>
              <Text variant="caption" tone="mute">
                {streak > 0 ? t("home.streakDays", { count: streak }) : t("home.streakNone")}
              </Text>
            </View>
          </Card>

          <Text variant="sectionTitle" accessibilityRole="header" style={styles.section}>
            {t("home.habitsTitle")}
          </Text>

          {items.length === 0 ? (
            <Card radius={20} padding={20} style={styles.nothing}>
              <Text variant="bodyStrong">{t("home.nothingTitle")}</Text>
              <Text tone="mute">{t("home.nothingSub")}</Text>
            </Card>
          ) : (
            <View style={styles.list}>
              {items.map(({ habit, log }) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  log={log}
                  subtitle={habitSubtitle(habit, log, locale, timeZone)}
                  selected={dual && selectedId === habit.id}
                  onOpen={() => (dual ? selectHabit(habit.id) : router.push({ pathname: "/habit/[id]", params: { id: habit.id } }))}
                  onToggle={() => toggleDone(habit.id, today)}
                />
              ))}
            </View>
          )}
        </>
      )}
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8 },
  retry: { minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center" },
  skeletonSummary: { height: 152 },
  skeletonRow: { height: 64, opacity: 0.6 },
  header: { gap: 2 },
  summary: { flexDirection: "row", alignItems: "center", gap: 20 },
  ratio: { fontFamily: "Manrope_800ExtraBold", fontSize: 30, lineHeight: 36 },
  phrase: { flex: 1, gap: 6 },
  section: { marginTop: 8 },
  list: { gap: 10 },
  nothing: { gap: 6 },
  empty: { alignItems: "center", gap: 12 },
  seed: { fontSize: 44, lineHeight: 52 },
  center: { textAlign: "center" },
});
