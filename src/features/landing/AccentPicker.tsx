import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { ACCENTS, layout } from "@/shared/tokens";
import { useThemeStore } from "@/store/theme";

/** As 7 cores de destaque do app. Trocar aqui muda a cor da página inteira, como no app. */
export function AccentPicker({ label }: { label: (n: number) => string }) {
  const theme = useTheme();
  const setAccent = useThemeStore((s) => s.setAccent);
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {ACCENTS.map((accent, i) => {
        const selected = accent === theme.acc;
        return (
          <Pressable
            key={accent}
            accessibilityRole="radio"
            accessibilityLabel={label(i + 1)}
            accessibilityState={{ selected }}
            onPress={() => setAccent(accent)}
            style={[styles.target, selected && { borderColor: theme.ink }]}
          >
            <View style={[styles.dot, { backgroundColor: accent }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  target: {
    flex: 1,
    maxWidth: layout.minTouch,
    height: layout.minTouch,
    borderRadius: layout.minTouch / 2,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 28, height: 28, borderRadius: 14 },
});
