import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { type TextVariant, typography } from "@/shared/tokens";

export type TextTone = "ink" | "mute" | "acc" | "accInk" | "danger";

interface Props extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({ variant = "body", tone = "ink", style, ...rest }: Props) {
  const theme = useTheme();
  return <RNText {...rest} style={[typography[variant], { color: theme[tone] }, style]} />;
}
