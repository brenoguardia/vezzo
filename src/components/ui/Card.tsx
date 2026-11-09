import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { radius as radii } from "@/shared/tokens";

interface Props {
  children: React.ReactNode;
  /** Raio: 20–28 (docs/05). */
  radius?: number;
  padding?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, radius = radii.card, padding = 16, onPress, accessibilityLabel, style }: Props) {
  const theme = useTheme();
  const base: ViewStyle = { backgroundColor: theme.card, borderRadius: radius, padding };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
