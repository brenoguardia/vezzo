import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";

interface Props {
  total?: number;
  /** Etapa atual, de 1 a `total` (barras até ela ficam preenchidas). */
  current: number;
  accessibilityLabel?: string;
}

export function ProgressSteps({ total = 3, current, accessibilityLabel }: Props) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={styles.row}
    >
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.bar, { backgroundColor: i < current ? theme.acc : theme.line }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
});
