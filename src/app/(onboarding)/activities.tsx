import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "@/components/ui";
import { useGoalsForm } from "@/features/onboarding/useGoalsForm";
import { currentLocale } from "@/features/onboarding/locale";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { t } from "@/i18n";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { CATEGORIES } from "@/shared/categories";
import { templateName } from "@/shared/onboarding";
import { useOnboardingStore } from "@/store/onboarding";

/** Onboarding 2/3 · atividades do catálogo local, por categoria. */
function GoalsSide() {
  const { body, footer } = useGoalsForm();
  return (
    <>
      <Text variant="sectionTitle" accessibilityRole="header">
        {t("onboarding.goalsTitle")}
      </Text>
      <Text tone="mute">{t("onboarding.goalsSub")}</Text>
      <View style={styles.goals}>{body}</View>
      <View style={styles.footer}>{footer}</View>
    </>
  );
}

export default function OnboardingActivities() {
  const { dual } = useLayoutMode();
  const router = useRouter();
  const selected = useOnboardingStore((s) => s.selected);
  const toggle = useOnboardingStore((s) => s.toggle);
  const locale = currentLocale();
  const count = Object.keys(selected).length;
  // As metas refletem a seleção: remonta o formulário quando os hábitos escolhidos mudam.
  const selectionKey = Object.keys(selected).sort().join(",");

  return (
    <OnboardingShell
      step={2}
      side={dual ? <GoalsSide key={selectionKey} /> : undefined}
      title={t("onboarding.activitiesTitle")}
      subtitle={t("onboarding.activitiesSub")}
      footer={
        <Button
          label={t("onboarding.continueCount", { count })}
          disabled={count < 1}
          onPress={() => router.push("/goals")}
        />
      }
    >
      <View style={styles.sections}>
        {CATEGORIES.map((category) => (
          <View key={category.slug} style={styles.section}>
            <Text variant="label" tone="mute" accessibilityRole="header">
              {locale === "en" ? category.nameEn : category.namePt}
            </Text>
            <View style={styles.chips}>
              {category.templates.map((template) => (
                <Chip
                  key={template.slug}
                  emoji={template.emoji}
                  label={templateName(template, locale)}
                  selected={!!selected[template.slug]}
                  onPress={() => toggle(template.slug)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 22 },
  section: { gap: 10 },
  goals: { gap: 14 },
  footer: { marginTop: "auto", paddingTop: 24, gap: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
