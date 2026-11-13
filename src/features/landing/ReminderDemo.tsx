import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { EmojiTile, Text } from "@/components/ui";
import type { LandingCopy } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { layout, radius } from "@/shared/tokens";
import { DemoShell } from "./DemoShell";

/** Notificação de lembrete com as três ações do app: toque numa ação e veja o resultado. */
export function ReminderDemo({ copy }: { copy: LandingCopy["reminder"] }) {
  const theme = useTheme();
  const [chosen, setChosen] = useState<number | null>(null);
  return (
    <DemoShell hint={copy.hint}>
      <View style={[styles.notification, { backgroundColor: theme.bg, borderColor: theme.line }]}>
        <View style={styles.head}>
          <EmojiTile emoji="💧" size={32} emojiOpacity={chosen === 0 ? 1 : 0.8} />
          <Text variant="captionStrong" tone="mute" style={styles.app}>
            {copy.app}
          </Text>
          <Text variant="caption" tone="mute">
            {copy.when}
          </Text>
        </View>
        <View accessibilityLiveRegion="polite">
          <Text variant="bodyStrong">{copy.title}</Text>
          <Text variant="body" tone={chosen === null ? "mute" : "acc"}>
            {chosen === null ? copy.body : copy.results[chosen]}
          </Text>
        </View>
        <View style={styles.actions}>
          {copy.actions.map((action, i) => {
            const selected = chosen === i;
            return (
              <Pressable
                key={action}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setChosen(selected ? null : i)}
                style={({ pressed }) => [
                  styles.action,
                  { backgroundColor: selected ? theme.acc : theme.card, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text variant="captionStrong" tone={selected ? "accInk" : "ink"}>
                  {action}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  notification: { borderRadius: radius.card, borderWidth: 1, padding: 16, gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  app: { flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  action: {
    flex: 1,
    minHeight: layout.minTouch,
    borderRadius: radius.chip,
    alignItems: "center",
    justifyContent: "center",
  },
});
