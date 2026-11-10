import { i18n } from "@/i18n";
import type { TFunction } from "@/i18n/useT";
import type { Locale } from "@/shared/onboarding";

/** Idioma atual lido na hora (para handlers). Em componentes use `useLocale()`, que é reativo. */
export const currentLocale = (): Locale => (i18n.locale === "en" ? "en" : "pt-BR");

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
/** Recebem o `t` do componente (`useT()`) para acompanhar a troca de idioma. */
export const dayLetters = (t: TFunction) => DAYS.map((d) => t(`onboarding.daysLetters.${d}`));
export const dayNames = (t: TFunction) => DAYS.map((d) => t(`onboarding.daysNames.${d}`));
