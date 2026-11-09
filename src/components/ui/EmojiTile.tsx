import { type StyleProp, Text as RNText, View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/useTheme";

interface Props {
  emoji: string;
  size?: number;
  /** Opacidade do emoji (pendente = 0,55 na home). */
  emojiOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

export function EmojiTile({ emoji, size = 40, emojiOpacity = 1, style }: Props) {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width: size, height: size, borderRadius: size * 0.35, backgroundColor: theme.tint },
        { alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      <RNText style={{ fontSize: size * 0.55, opacity: emojiOpacity, includeFontPadding: false }}>{emoji}</RNText>
    </View>
  );
}
