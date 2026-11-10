import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { Text } from "./Text";

interface Props<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

/** Controle segmentado (Escuro/Claro/Sistema): selecionado em `acc`, trilho em `card`. */
export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.card }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && { backgroundColor: theme.acc }]}
          >
            <Text variant="bodyMedium" tone={selected ? "accInk" : "mute"} style={styles.label}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", borderRadius: radius.field, padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 44, borderRadius: radius.chip, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "700" },
});
