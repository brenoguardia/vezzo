import { z } from "zod";
import { ACCENTS, language, themeMode, timezone } from "./common";

export const profileUpdate = z.object({
  displayName: z.string().trim().min(1).max(30).optional(),
  accent: z.enum(ACCENTS).optional(),
  themeMode: themeMode.optional(),
  language: language.optional(),
  timezone: timezone.optional(),
});

export const profileDto = z.object({
  displayName: z.string(),
  accent: z.string(),
  themeMode,
  language,
  timezone: z.string(),
  onboardingDone: z.boolean(),
  createdAt: z.string(),
});
export type ProfileDto = z.infer<typeof profileDto>;
