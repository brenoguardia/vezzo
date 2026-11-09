import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { Text } from "./Text";

interface Props {
  /** Valor já formatado (ex.: "2,5 L"). */
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementLabel: string;
  incrementLabel: string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
}

export function Stepper({
  value,
  onDecrement,
  onIncrement,
  decrementLabel,
  incrementLabel,
  decrementDisabled,
  incrementDisabled,
}: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={decrementLabel}
        disabled={decrementDisabled}
        hitSlop={8}
        onPress={onDecrement}
        style={[styles.btn, { borderWidth: 1, borderColor: theme.line, opacity: decrementDisabled ? 0.4 : 1 }]}
      >
        <Text variant="bodyStrong" style={styles.glyph}>
          −
        </Text>
      </Pressable>
      <Text variant="bodyMedium" accessibilityRole="adjustable" style={styles.value}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={incrementLabel}
        disabled={incrementDisabled}
        hitSlop={8}
        onPress={onIncrement}
        style={[styles.btn, { backgroundColor: theme.acc, opacity: incrementDisabled ? 0.4 : 1 }]}
      >
        <Text variant="bodyStrong" tone="accInk" style={styles.glyph}>
          +
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  glyph: { fontSize: 16, lineHeight: 20, includeFontPadding: false },
  value: { minWidth: 48, textAlign: "center" },
});
