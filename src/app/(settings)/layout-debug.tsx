import { useVerticalBarEdgeIOS } from "expo-status-bar";
import { PixelRatio, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Text } from "@/components/ui";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useT } from "@/i18n/useT";
import { layoutInfo } from "@/lib/layout-mode";

/**
 * Somente dev (`__DEV__`): mostra o que o dispositivo informa (janela, safe area, rail vertical)
 * para conferir dobráveis como o iPhone Duo em cada pose (fechado, aberto, notebook).
 */
export default function LayoutDebug() {
  const t = useT();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rail = useVerticalBarEdgeIOS();
  const info = layoutInfo(width);

  if (!__DEV__) return null;

  const rows: [string, string][] = [
    [t("layoutDebug.window"), `${Math.round(width)} × ${Math.round(height)} pt`],
    [t("layoutDebug.pixelRatio"), `${PixelRatio.get()}×`],
    [t("layoutDebug.insets"), `T ${insets.top} · R ${insets.right} · B ${insets.bottom} · L ${insets.left}`],
    [t("layoutDebug.rail"), rail ?? "—"],
    [t("layoutDebug.mode"), `${info.mode} · ${Math.round(info.columnWidth)} pt`],
  ];

  return (
    <SettingsShell tabBar={false} back title={t("profile.debugLayout")}>
      <Card style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} testID={`layout-${label}`} style={styles.row}>
            <Text variant="caption" tone="mute">
              {label}
            </Text>
            <Text variant="bodyStrong">{value}</Text>
          </View>
        ))}
      </Card>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  row: { gap: 2 },
});
