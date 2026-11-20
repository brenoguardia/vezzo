import { ActivityIndicator, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, radius } from "@/shared/tokens";
import { Text } from "./Text";

interface Props {
  label: string;
  onPress?: () => void;
  /** `danger`: ação destrutiva (Excluir conta), com cor de perigo e texto legível nos dois temas. */
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  /** Elemento à esquerda do rótulo (ex.: logo do Google/Apple). */
  left?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = "primary", disabled, loading, left, style }: Props) {
  const theme = useTheme();
  const primary = variant === "primary";
  const danger = variant === "danger";
  const filled = primary || danger;
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        filled ? { backgroundColor: danger ? theme.danger : theme.acc } : { borderWidth: 1, borderColor: theme.line },
        // 0,55 mantém o rótulo legível (≈4,4:1) também no tema escuro; com 0,4 caía para ≈2,8:1.
        { opacity: disabled ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={danger ? theme.dangerInk : primary ? theme.accInk : theme.ink} />
      ) : (
        <View style={styles.content}>
          {left}
          <Text
            tone={danger ? "dangerInk" : primary ? "accInk" : "ink"}
            style={{ fontFamily: filled ? fontFamily.bold : fontFamily.semibold, fontSize: 16, lineHeight: 22 }}
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
