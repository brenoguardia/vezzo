import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { unarchiveHabit } from "@/api/habits";
import { Button, Card, EmojiTile, Text } from "@/components/ui";
import { EditHabitPanel } from "@/features/habits/EditHabitPanel";
import { activeHabits } from "@/features/habits/selectors";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { useTheme } from "@/lib/useTheme";
import type { GoalUnit } from "@/shared/categories";
import { formatGoal } from "@/shared/onboarding";
import type { HabitDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useToastStore } from "@/store/toast";

/** Gerenciar hábitos (aba Hábitos): ativos, arquivados e atalho para criar. */
export default function Habits() {
  const t = useT();
  const router = useRouter();
  const theme = useTheme();
  const locale = useLocale();
  const habits = useHabitsStore((s) => s.habits);
  const selectedId = useHabitsStore((s) => s.selectedHabitId);
  const selectHabit = useHabitsStore((s) => s.selectHabit);
  const { dual } = useLayoutMode();
  const upsert = useHabitsStore((s) => s.upsertHabit);
  const showToast = useToastStore((s) => s.show);
  const active = activeHabits(habits);
  const archived = habits.filter((h) => h.archivedAt);

  async function unarchive(id: string) {
    try {
      upsert(await unarchiveHabit(id));
    } catch {
      showToast(t("habit.unarchiveError"));
    }
  }

  const open = (h: HabitDto) =>
    dual ? selectHabit(h.id) : router.push({ pathname: "/habit/[id]", params: { id: h.id } });
  const editing = dual ? active.find((h) => h.id === selectedId) : undefined;
  const subtitle = (h: HabitDto) =>
    h.goalUnit === "BOOLEAN" ? t("onboarding.daily") : formatGoal(h.goalValue, h.goalUnit as GoalUnit, locale);

  // Dual (docs/08): esquerda a lista, direita a edição do hábito selecionado.
  const aside = editing ? (
    <EditHabitPanel
      id={editing.id}
      onSaved={() => undefined}
      onCancel={() => selectHabit(null)}
      onArchived={() => selectHabit(null)}
    />
  ) : (
    <Text tone="mute">{t("manage.selectHint")}</Text>
  );

  return (
    <SettingsShell aside={aside} asideScrolls={!editing}>
      <Text variant="screenTitle" accessibilityRole="header">
        {t("manage.title")}
      </Text>
      <Button label={t("manage.newHabit")} onPress={() => router.push("/habit/new")} />

      <Text variant="label" tone="mute">
        {t("manage.active")}
      </Text>
      {active.length === 0 ? (
        <Text tone="mute">{t("home.emptySub")}</Text>
      ) : (
        <View style={styles.list}>
          {active.map((h) => (
            <Card
              key={h.id}
              radius={20}
              padding={13}
              onPress={() => open(h)}
              accessibilityLabel={`${h.name}. ${subtitle(h)}`}
              style={[styles.row, dual && selectedId === h.id && { borderWidth: 2, borderColor: theme.acc }]}
            >
              <EmojiTile emoji={h.emoji} size={40} />
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {h.name}
                </Text>
                <Text variant="caption" tone="mute">
                  {subtitle(h)}
                </Text>
              </View>
              <Text tone="mute" accessibilityElementsHidden importantForAccessibility="no">
                ›
              </Text>
            </Card>
          ))}
        </View>
      )}

      <Text variant="label" tone="mute" style={styles.section}>
        {t("manage.archivedSection")}
      </Text>
      {archived.length === 0 ? (
        <Text tone="mute">{t("manage.emptyArchived")}</Text>
      ) : (
        <View style={styles.list}>
          {archived.map((h) => (
            <Card key={h.id} radius={20} padding={13} style={styles.row}>
              <View style={[styles.row, styles.flex, styles.dim]}>
                <EmojiTile emoji={h.emoji} size={40} />
                <View style={styles.flex}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {h.name}
                  </Text>
                  <Text variant="caption" tone="mute">
                    {t("habit.archived")}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t("habit.unarchive")}: ${h.name}`}
                onPress={() => void unarchive(h.id)}
                style={styles.unarchive}
              >
                <Text variant="bodyStrong" tone="acc">
                  {t("habit.unarchive")}
                </Text>
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 66 },
  section: { marginTop: 8 },
  dim: { opacity: 0.6 },
  unarchive: { minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 6 },
});
