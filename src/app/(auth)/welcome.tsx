import { useRouter } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text } from "@/components/ui";
import { BrandMark } from "@/features/auth/BrandMark";
import { t } from "@/i18n";
import { useTheme } from "@/lib/useTheme";

export default function Welcome() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <View style={styles.center}>
        <BrandMark />
        <Text variant="brand" style={styles.name}>
          Vezzo
        </Text>
        <Text variant="bodyStrong" tone="mute" style={styles.tagline}>
          {t("auth.tagline")}
        </Text>
      </View>
      <View style={[styles.footer, { width: Math.min(width, 480), paddingBottom: Math.max(insets.bottom, 0) + 56 }]}>
        <Button label={t("auth.createAccount")} onPress={() => router.push("/sign-up")} />
        <Button label={t("auth.haveAccount")} variant="secondary" onPress={() => router.push("/sign-in")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  name: { marginTop: 20 },
  tagline: { marginTop: 8, fontWeight: "500" },
  footer: { paddingHorizontal: 32, gap: 12 },
});
