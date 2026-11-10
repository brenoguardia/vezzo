import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { type TextVariant, typography } from "@/shared/tokens";

export type TextTone = "ink" | "mute" | "acc" | "accInk" | "danger";

/** Teto do Dynamic Type / fonte do Android (docs: suporte até 130%). */
export const MAX_FONT_SCALE = 1.3;

interface Props extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({ variant = "body", tone = "ink", style, maxFontSizeMultiplier = MAX_FONT_SCALE, ...rest }: Props) {
  const theme = useTheme();
  const color = tone === "acc" ? theme.accText : theme[tone];
  return <RNText {...rest} maxFontSizeMultiplier={maxFontSizeMultiplier} style={[typography[variant], { color }, style]} />;
}
