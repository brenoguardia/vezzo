import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { EmojiTile, Ring, Text } from "@/components/ui";
import type { LandingCopy } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, layout, radius } from "@/shared/tokens";
import { DemoShell, fill } from "./DemoShell";

/** Hábitos já feitos quando a página abre (Meditar, Treinar e Registrar gastos), como na tela Hoje do app. */
const INITIAL_DONE = [1, 2, 4];
const BASE_STREAK = 12;

/**
 * A tela "Hoje" do app, ao vivo: toque num hábito e o anel, a mensagem e a sequência respondem.
 * Usa o mesmo `Ring` e `EmojiTile` do app, então acompanha cor de destaque e tema.
 */
export function TodayDemo({ copy }: { copy: LandingCopy["demo"] }) {
  const theme = useTheme();
  const [done, setDone] = useState<number[]>(INITIAL_DONE);
  const total = copy.habits.length;
  const complete = done.length === total;
  const message = done.length === 0 ? copy.messages.none : complete ? copy.messages.all : copy.messages.some;
  const streak = BASE_STREAK + (complete ? 1 : 0);

  const toggle = (index: number) =>
    setDone((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]));

  return (
    <DemoShell hint={copy.hint}>
      <View>
        <Text variant="bodyMedium" tone="mute">
          {copy.greeting}
        </Text>
        <Text variant="screenTitle">{copy.name}</Text>
      </View>

      <View style={[styles.summary, { backgroundColor: theme.bg }]}>
        <Ring
          progress={done.length / total}
          size={96}
          strokeWidth={10}
          accessibilityLabel={fill(copy.progress, { done: done.length, total })}
        >
          <Text style={styles.ringValue}>
            {done.length}/{total}
          </Text>
          <Text variant="caption" tone="mute">
            {copy.doneLabel}
          </Text>
        </Ring>
        <View style={styles.summaryText} accessibilityLiveRegion="polite">
          <Text variant="bodyStrong">{message}</Text>
          <Text variant="caption" tone="mute">
            {fill(copy.streak, { count: streak })}
          </Text>
        </View>
      </View>

      <Text variant="sectionTitle" accessibilityRole="header">
        {copy.habitsTitle}
      </Text>
      <View style={styles.list}>
        {copy.habits.map((habit, index) => {
          const checked = done.includes(index);
          return (
            <Pressable
              key={habit.name}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={`${habit.name}, ${habit.detail}`}
              onPress={() => toggle(index)}
              style={({ pressed }) => [styles.row, { backgroundColor: theme.bg, opacity: pressed ? 0.85 : 1 }]}
            >
              <EmojiTile emoji={habit.emoji} size={40} emojiOpacity={checked ? 1 : 0.55} />
              <View style={styles.rowText}>
                <Text variant="bodyStrong">{habit.name}</Text>
                <Text variant="caption" tone="mute">
                  {habit.detail}
                </Text>
              </View>
              <View
                style={[
                  styles.check,
                  checked ? { backgroundColor: theme.acc, borderColor: theme.acc } : { borderColor: theme.line },
                ]}
              >
                {checked ? (
                  <Text tone="accInk" style={styles.checkMark}>
                    ✓
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: radius.card, padding: 16 },
  summaryText: { flex: 1, gap: 4 },
  ringValue: { fontFamily: fontFamily.extrabold, fontSize: 24, lineHeight: 28, letterSpacing: -0.5 },
  list: { gap: 8 },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.field,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: { flex: 1 },
  check: {
    width: layout.minTouch - 16,
    height: layout.minTouch - 16,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { fontFamily: fontFamily.extrabold, fontSize: 16, lineHeight: 20 },
});
