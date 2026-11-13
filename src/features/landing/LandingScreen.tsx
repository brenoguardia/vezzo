import { useEffect } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/ui";
import { setLocale } from "@/i18n";
import { getLandingCopy } from "@/i18n/landing";
import { useLocale } from "@/i18n/useLocale";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, layout } from "@/shared/tokens";
import { useThemeStore } from "@/store/theme";
import { Also, Container, FeatureRows, FinalCta, Footer, Hero, PrivacyBand, Steps } from "./sections";

/** Largura da janela a partir da qual a landing usa duas colunas (a regra é por largura, nunca por aparelho). */
export const LANDING_WIDE = 900;

function Header({ copy }: { copy: ReturnType<typeof getLandingCopy> }) {
  const theme = useTheme();
  const locale = useLocale();
  const setMode = useThemeStore((s) => s.setMode);
  return (
    <Container style={styles.header}>
      <View style={styles.brand}>
        <Image
          accessibilityIgnoresInvertColors
          source={require("../../../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text variant="sectionTitle" style={styles.brandText}>
          Vezzo
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.nav.language}
          onPress={() => setLocale(locale === "en" ? "pt-BR" : "en")}
          style={[styles.action, { borderColor: theme.line }]}
        >
          <Text variant="captionStrong">{locale === "en" ? "PT" : "EN"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.nav.theme}
          onPress={() => setMode(theme.scheme === "dark" ? "light" : "dark")}
          style={[styles.action, { borderColor: theme.line }]}
        >
          <Text variant="bodyStrong" accessibilityElementsHidden importantForAccessibility="no">
            {theme.scheme === "dark" ? "☀" : "☾"}
          </Text>
        </Pressable>
      </View>
    </Container>
  );
}

/** Página de vendas pública (web): apresenta o app, as funções e os links legais. */
export function LandingScreen() {
  const theme = useTheme();
  const locale = useLocale();
  const { width } = useWindowDimensions();
  const wide = width >= LANDING_WIDE;
  const copy = getLandingCopy(locale);

  // Mantém o idioma do documento coerente com o texto exibido (leitores de tela e tradutores do navegador).
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.content}>
      <Header copy={copy} />
      <Hero copy={copy} wide={wide} />
      <Steps copy={copy.steps} wide={wide} />
      <FeatureRows copy={copy} wide={wide} />
      <Also copy={copy.also} wide={wide} />
      <PrivacyBand copy={copy.privacy} wide={wide} />
      <FinalCta copy={copy.cta} stores={copy.stores} />
      <Footer copy={copy.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 8,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 10 },
  brandText: { fontFamily: fontFamily.extrabold, fontSize: 22, lineHeight: 28 },
  actions: { flexDirection: "row", gap: 8 },
  action: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
