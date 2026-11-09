import { ActivityIndicator, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, radius } from "@/shared/tokens";
import { Text } from "./Text";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  /** Elemento à esquerda do rótulo (ex.: logo do Google/Apple). */
  left?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = "primary", disabled, loading, left, style }: Props) {
  const theme = useTheme();
  const primary = variant === "primary";
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? { backgroundColor: theme.acc } : { borderWidth: 1, borderColor: theme.line },
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? theme.accInk : theme.ink} />
      ) : (
        <View style={styles.content}>
          {left}
          <Text
            tone={primary ? "accInk" : "ink"}
            style={{ fontFamily: primary ? fontFamily.bold : fontFamily.semibold, fontSize: 16, lineHeight: 22 }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: { flexDirection: "row", alignItems: "center", gap: 10 },
});
