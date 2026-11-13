import type { Locale } from "../index";
import { landingEn } from "./en";
import { landingPtBR } from "./pt-BR";
import type { LandingCopy } from "./types";

export type { LandingAlso, LandingCopy, LandingDemoHabit, LandingPreset, LandingRow, LandingStep, Week } from "./types";

const copies: Record<Locale, LandingCopy> = { "pt-BR": landingPtBR, en: landingEn };

/** Textos da landing no idioma pedido. */
export function getLandingCopy(locale: Locale): LandingCopy {
  return copies[locale];
}
