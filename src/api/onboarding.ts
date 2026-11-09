import { apiFetch } from "@/api/client";
import { type OnboardingCompleteInput, type OnboardingResult, onboardingResult } from "@/shared/schemas";

/** `POST /v1/onboarding/complete`: grava nome + hábitos escolhidos e marca o onboarding como concluído. */
export function completeOnboarding(input: OnboardingCompleteInput): Promise<OnboardingResult> {
  return apiFetch("/v1/onboarding/complete", onboardingResult, { method: "POST", body: JSON.stringify(input) });
}
