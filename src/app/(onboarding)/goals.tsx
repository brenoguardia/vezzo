import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { useGoalsForm } from "@/features/onboarding/useGoalsForm";
import { useT } from "@/i18n/useT";

/** Onboarding 3/3 · metas e dias por hábito; "Começar" chama `POST /v1/onboarding/complete`. */
export default function OnboardingGoals() {
  const t = useT();
  const { body, footer } = useGoalsForm();
  return (
    <OnboardingShell step={3} title={t("onboarding.goalsTitle")} subtitle={t("onboarding.goalsSub")} footer={footer}>
      {body}
    </OnboardingShell>
  );
}
