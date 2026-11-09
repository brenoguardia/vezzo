import { z } from "zod";
import { habitDto, habitInput } from "./habit";
import { profileDto } from "./profile";

export const onboardingComplete = z.object({
  displayName: z.string().trim().min(1).max(30),
  habits: z.array(habitInput).min(1).max(20),
});
export type OnboardingCompleteInput = z.input<typeof onboardingComplete>;

/** Etapa 1 do onboarding (nome). */
export const onboardingNameInput = onboardingComplete.pick({ displayName: true });
export type OnboardingNameInput = z.infer<typeof onboardingNameInput>;

/** Etapa 3 do onboarding (metas), via `useFieldArray`. */
export const onboardingGoalsInput = onboardingComplete.pick({ habits: true });

export const onboardingResult = z.object({
  profile: profileDto,
  habits: z.array(habitDto),
});
export type OnboardingResult = z.infer<typeof onboardingResult>;
