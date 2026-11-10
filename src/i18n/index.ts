import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import { en } from "./en";
import { ptBR } from "./pt-BR";

export type Locale = "pt-BR" | "en";

export const i18n = new I18n({ "pt-BR": ptBR, en });
i18n.defaultLocale = "pt-BR";
i18n.enableFallback = true;

/** Idioma inicial pelo aparelho: português vira pt-BR, qualquer outro vira en. */
export function detectLocale(languageCode: string | null | undefined): Locale {
  return languageCode === "pt" ? "pt-BR" : "en";
}
i18n.locale = detectLocale(getLocales()[0]?.languageCode);

export function setLocale(locale: Locale) {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, string | number>): string {
  return i18n.t(key, options);
}

/** Mensagens de validação do Zod são chaves `auth.errors.*`; qualquer outra coisa passa direto. */
export function translateMessage(
  message: string | undefined,
  translate: (key: string) => string = t,
): string | undefined {
  if (!message) return undefined;
  return message.startsWith("auth.errors.") ? translate(message) : message;
}
