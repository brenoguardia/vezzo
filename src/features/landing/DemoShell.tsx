import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";

/** Cartão das demos da landing (mesmo visual da tela Hoje) com a dica de uso logo abaixo. */
export function DemoShell({ children, hint }: { children: ReactNode; hint: string }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>{children}</View>
      <Text variant="caption" tone="mute" style={styles.hint}>
        {hint}
      </Text>
    </View>
  );
}

/** Substitui `{chave}` pelos valores (os textos da landing usam esse modelo). */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 400, gap: 12 },
  card: { borderRadius: radius.cardHero, borderWidth: 1, padding: 20, gap: 16 },
  hint: { textAlign: "center" },
});
