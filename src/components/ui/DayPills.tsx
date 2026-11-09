import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { Text } from "./Text";

interface Props {
  /** 7 rótulos, de segunda (0) a domingo (6). */
  labels: readonly string[];
  /** Dias ativos: 0 = segunda … 6 = domingo. */
  value: readonly number[];
  onChange: (days: number[]) => void;
  /** Nomes completos para leitores de tela (opcional). */
  accessibilityLabels?: readonly string[];
}

export function DayPills({ labels, value, onChange, accessibilityLabels }: Props) {
  const theme = useTheme();
  const toggle = (day: number) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onChange(next.sort((a, b) => a - b));
  };
  return (
    <View style={styles.row}>
      {labels.map((label, day) => {
        const active = value.includes(day);
        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabels?.[day] ?? label}
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 10, bottom: 10 }}
            onPress={() => toggle(day)}
            style={[styles.pill, { backgroundColor: active ? theme.acc : theme.line }]}
          >
            <Text variant="captionStrong" tone={active ? "accInk" : "mute"} style={styles.text}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  pill: { flex: 1, paddingVertical: 7, borderRadius: radius.pill, alignItems: "center" },
  text: { fontSize: 11, lineHeight: 15 },
});
