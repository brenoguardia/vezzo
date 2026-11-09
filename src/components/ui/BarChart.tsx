import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { Text } from "./Text";

export interface BarDatum {
  label: string;
  /** 0–1 */
  value: number;
  /** Dia atual: usa `acc`. */
  highlight?: boolean;
}

interface Props {
  data: BarDatum[];
  height?: number;
  accessibilityLabel?: string;
}

export function BarChart({ data, height = 150, accessibilityLabel }: Props) {
  const theme = useTheme();
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {data.map((d, i) => {
        const v = Math.min(1, Math.max(0, d.value));
        return (
          <View key={`${d.label}-${i}`} style={styles.col}>
            <View style={[styles.track, { height }]}>
              <View
                style={{
                  height: Math.max(v * height, 4),
                  borderRadius: 10,
                  backgroundColor: d.highlight ? theme.acc : theme.line,
                }}
              />
            </View>
            <Text variant="captionStrong" tone={d.highlight ? "ink" : "mute"} style={styles.label}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1, alignItems: "stretch" },
  track: { justifyContent: "flex-end" },
  label: { fontSize: 11, lineHeight: 15, textAlign: "center", marginTop: 8 },
});
