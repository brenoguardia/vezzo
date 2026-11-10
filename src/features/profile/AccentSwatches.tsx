import { Pressable, StyleSheet, View } from "react-native";
import { t } from "@/i18n";
import { useTheme } from "@/lib/useTheme";
import { ACCENTS, type Accent } from "@/shared/tokens";

const SIZE = 50;
const RING = 2;
const OFFSET = 3;

export const accentName = (accent: string): string => {
  const index = (ACCENTS as readonly string[]).indexOf(accent);
  return index < 0 ? accent : t(`theme.accentNames.${index}`);
};

interface Props {
  value: Accent;
  onChange: (accent: Accent) => void;
}

/** 7 círculos de 50; o selecionado ganha contorno 2 `ink` com afastamento de 3 (docs/05). */
export function AccentSwatches({ value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t("theme.accentLabel")} style={styles.row}>
      {ACCENTS.map((accent) => {
        const selected = accent === value;
        return (
          <Pressable
            key={accent}
            accessibilityRole="radio"
            accessibilityLabel={accentName(accent)}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(accent)}
            style={[styles.ring, { borderColor: selected ? theme.ink : "transparent" }]}
          >
            <View style={[styles.dot, { backgroundColor: accent }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const OUTER = SIZE + 2 * (RING + OFFSET);

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginHorizontal: -(RING + OFFSET) },
  ring: {
    width: OUTER,
    height: OUTER,
    borderRadius: OUTER / 2,
    borderWidth: RING,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
});
