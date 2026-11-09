import { i18n, t } from "@/i18n";
import type { Locale } from "@/shared/onboarding";

export const currentLocale = (): Locale => (i18n.locale === "en" ? "en" : "pt-BR");

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export const dayLetters = () => DAYS.map((d) => t(`onboarding.daysLetters.${d}`));
export const dayNames = () => DAYS.map((d) => t(`onboarding.daysNames.${d}`));
