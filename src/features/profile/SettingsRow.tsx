import { Pressable, StyleSheet, View } from "react-native";
import { Skeleton, SkeletonGroup, Text } from "@/components/ui";
import { useTheme } from "@/lib/useTheme";

interface Props {
  label: string;
  value?: string;
  onPress?: () => void;
  /** "danger" pinta o rótulo com a cor de perigo (Sair, Excluir conta). */
  tone?: "ink" | "danger";
  chevron?: boolean;
  /** Remove a linha divisória inferior (última linha do cartão). */
  last?: boolean;
  disabled?: boolean;
  /** Valor ainda carregando: mostra um skeleton no lugar dele. */
  loading?: boolean;
  accessibilityState?: { expanded?: boolean; busy?: boolean };
}

/** Linha de cartão de configurações: altura mínima 52 (≥ 44 de toque), divisória `line`. */
export function SettingsRow({
  label,
  value,
  onPress,
  tone = "ink",
  chevron,
  last,
  disabled,
  loading,
  accessibilityState,
}: Props) {
  const theme = useTheme();
  const content = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.line }]}>
      <Text variant="bodyStrong" tone={tone}>
        {label}
      </Text>
      {loading ? (
        <SkeletonGroup>
          <Skeleton width={72} height={14} radius={6} />
        </SkeletonGroup>
      ) : value ? (
        <Text tone="mute" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {chevron ? (
        <Text tone="mute" accessibilityElementsHidden importantForAccessibility="no">
          ›
        </Text>
      ) : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  value: { flexShrink: 1, textAlign: "right" },
});
