import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "@/components/ui";
import { currentLocale } from "@/features/onboarding/locale";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { t } from "@/i18n";
import { CATEGORIES } from "@/shared/categories";
import { templateName } from "@/shared/onboarding";
import { useOnboardingStore } from "@/store/onboarding";

/** Onboarding 2/3 · atividades do catálogo local, por categoria. */
export default function OnboardingActivities() {
  const router = useRouter();
  const selected = useOnboardingStore((s) => s.selected);
  const toggle = useOnboardingStore((s) => s.toggle);
  const locale = currentLocale();
  const count = Object.keys(selected).length;

  return (
    <OnboardingShell
      step={2}
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
