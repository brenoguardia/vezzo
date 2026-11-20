import { Pressable, StyleSheet, Switch, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { Card } from "./Card";
import { Text } from "./Text";

interface Props {
  label: string;
  /** Texto de apoio abaixo do rótulo. */
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * Linha com interruptor. A linha inteira alterna o valor (o `Switch` sozinho tem só ~27 dp de altura,
 * abaixo dos 44 pt de toque) e é anunciada como um único "switch" aos leitores de tela.
 */
export function SwitchRow({ label, hint, value, onValueChange }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
    >
      <Card radius={16} padding={14} style={styles.row}>
        <View style={styles.flex}>
          <Text variant="bodyMedium">{label}</Text>
          {hint ? (
            <Text variant="caption" tone="mute">
              {hint}
            </Text>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          trackColor={{ true: theme.acc, false: theme.line }}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52 },
  flex: { flex: 1 },
});
