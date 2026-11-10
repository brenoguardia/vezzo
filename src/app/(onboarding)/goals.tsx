import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { useGoalsForm } from "@/features/onboarding/useGoalsForm";
import { t } from "@/i18n";

/** Onboarding 3/3 · metas e dias por hábito; "Começar" chama `POST /v1/onboarding/complete`. */
export default function OnboardingGoals() {
  const { body, footer } = useGoalsForm();
  return (
    <OnboardingShell step={3} title={t("onboarding.goalsTitle")} subtitle={t("onboarding.goalsSub")} footer={footer}>
      {body}
    </OnboardingShell>
  );
}
