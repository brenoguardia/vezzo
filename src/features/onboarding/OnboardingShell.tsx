import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SplitView } from "@/components/layout";
import { ProgressSteps, Text } from "@/components/ui";
import { t } from "@/i18n";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { useTheme } from "@/lib/useTheme";
import { layout, type TextVariant } from "@/shared/tokens";

export const ONBOARDING_STEPS = 3;

interface Props {
  /** Etapa de 1 a 3; sem valor, não mostra a barra de progresso (tela de lembretes). */
  step?: number;
  title: string;
  titleVariant?: Extract<TextVariant, "onboardingTitle" | "authTitle">;
  subtitle?: string;
  children?: ReactNode;
  /** Botão primário ancorado ao fim (56 do fim, docs/05). */
  footer: ReactNode;
  /**
   * Coluna da direita no modo dual (atividades à esquerda, metas à direita, docs/08). Quando
   * presente e a janela é larga, o `footer` da esquerda não aparece: o botão final vive em `side`.
   */
  side?: ReactNode;
}

/** Casca das etapas do onboarding: margem 28, safe area, teclado, largura máxima em telas largas. */
export function OnboardingShell({ step, title, titleVariant = "authTitle", subtitle, children, footer, side }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dual, width } = useLayoutMode();
  const contentWidth = Math.min(width, layout.formMaxWidth);

  const heading = (
    <>
      {step ? (
        <ProgressSteps
          total={ONBOARDING_STEPS}
          current={step}
          accessibilityLabel={t("onboarding.step", { current: step, total: ONBOARDING_STEPS })}
        />
      ) : null}
      <Text variant={titleVariant} accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text tone="mute" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </>
  );

  if (dual && side) {
    return (
      <View style={styles.flex}>
        <SplitView
          tabBar={false}
          left={
            <>
              {heading}
              {children ? <View style={styles.body}>{children}</View> : null}
            </>
          }
          right={side}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 56 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, paddingHorizontal: layout.authMargin, flexGrow: 1 }}>
          {heading}
          {children ? <View style={styles.body}>{children}</View> : null}
          <View style={styles.footer}>{footer}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: "center" },
  title: { marginTop: 28 },
  subtitle: { marginTop: 10 },
  body: { marginTop: 24, gap: 14 },
  footer: { marginTop: "auto", paddingTop: 32, gap: 14 },
});
