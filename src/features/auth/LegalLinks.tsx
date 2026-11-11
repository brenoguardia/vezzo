import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { layout } from "@/shared/tokens";

/** "Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade", com os dois links. */
export function LegalLinks() {
  const t = useT();
  const router = useRouter();
  return (
    <Text variant="caption" tone="mute" style={styles.root}>
      {t("legal.agree")}{" "}
      <Text
        variant="captionStrong"
        tone="acc"
        accessibilityRole="link"
        onPress={() => router.push("/terms")}
        style={styles.link}
      >
        {t("legal.terms")}
      </Text>{" "}
      {t("legal.and")}{" "}
      <Text
        variant="captionStrong"
        tone="acc"
        accessibilityRole="link"
        onPress={() => router.push("/privacy")}
        style={styles.link}
      >
        {t("legal.privacy")}
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { textAlign: "center", lineHeight: 20, minHeight: layout.minTouch },
  link: { textDecorationLine: "underline" },
});
