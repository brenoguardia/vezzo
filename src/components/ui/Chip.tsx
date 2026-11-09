import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { Text } from "./Text";

interface Props {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, emoji, selected = false, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.base,
        selected
          ? { backgroundColor: theme.acc, borderColor: theme.acc }
          : { backgroundColor: "transparent", borderColor: theme.line },
      ]}
    >
      <Text variant="bodyMedium" tone={selected ? "accInk" : "ink"} style={styles.text}>
        {emoji ? `${emoji}  ` : ""}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    borderWidth: 1,
    justifyContent: "center",
  },
  text: { fontSize: 14, lineHeight: 20 },
});
