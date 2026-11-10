import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import { layout } from "@/shared/tokens";

const MAX_CONTENT_WIDTH = 480;

interface Props {
  title: string;
  subtitle?: string;
  /** Mostra "‹ Voltar" no topo. */
  back?: boolean;
  children: ReactNode;
  /** Ancorado ao fim da tela (botão primário a 56 do fim, docs/05). */
  footer?: ReactNode;
}

/** Casca das telas de autenticação: margem 28, safe area, teclado e largura máxima em telas largas. */
export function AuthScreen({ title, subtitle, back, children, footer }: Props) {
  const t = useT();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 0) + 56 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, paddingHorizontal: layout.authMargin, flexGrow: 1 }}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/sign-in"))}
              hitSlop={8}
              style={styles.back}
            >
              <Text variant="bodyMedium" tone="mute" style={styles.backText}>
                ‹ {t("common.back")}
              </Text>
            </Pressable>
          ) : null}
          <Text variant="authTitle" accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text tone="mute" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: "center" },
  back: { minHeight: layout.minTouch, justifyContent: "center", alignSelf: "flex-start" },
  backText: { fontWeight: "700" },
  title: { marginTop: 28 },
  subtitle: { marginTop: 10 },
  body: { marginTop: 24, gap: 14 },
  footer: { marginTop: "auto", paddingTop: 32, gap: 14 },
});
