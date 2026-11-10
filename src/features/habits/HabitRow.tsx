import { Pressable, StyleSheet, View } from "react-native";
import { Card, EmojiTile, Text } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import type { HabitDto } from "@/shared/schemas";
import { layout } from "@/shared/tokens";
import type { DayLog } from "@/store/habits";

interface Props {
  habit: HabitDto;
  log?: DayLog;
  subtitle: string;
  onOpen: () => void;
  onToggle: () => void;
  /** Linha aberta no painel de detalhe (modo dual). */
  selected?: boolean;
}

/** Cartão de hábito da home: emoji, nome, progresso e círculo de check (≥ 44 pt de toque). */
export function HabitRow({ habit, log, subtitle, onOpen, onToggle, selected }: Props) {
  const t = useT();
  const theme = useTheme();
  const done = log?.status === "DONE";
  return (
    <Card radius={20} padding={0} style={[styles.card, selected && { borderWidth: 2, borderColor: theme.acc }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}. ${subtitle}`}
        accessibilityState={{ selected: !!selected }}
        onPress={onOpen}
        style={styles.main}
      >
        <EmojiTile emoji={habit.emoji} size={40} emojiOpacity={done ? 1 : 0.55} />
        <View style={styles.text}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {habit.name}
          </Text>
          <Text variant="caption" tone="mute" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={t(done ? "home.markUndone" : "home.markDone", { habit: habit.name })}
        onPress={onToggle}
        style={styles.checkTarget}
      >
        <View
          style={[
            styles.check,
            done ? { backgroundColor: theme.acc } : { borderWidth: 2, borderColor: theme.line },
          ]}
        >
          {done ? (
            <Text variant="captionStrong" tone="accInk" style={styles.tick}>
              ✓
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", minHeight: 66 },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, paddingLeft: 16, minHeight: layout.minTouch },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 15, lineHeight: 20 },
  checkTarget: { width: layout.minTouch + 8, height: layout.minTouch + 8, alignItems: "center", justifyContent: "center" },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tick: { fontSize: 14, lineHeight: 18 },
});
