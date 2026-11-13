import Constants from "expo-constants";

const FALLBACK_SCHEME = "vezzo";

/** Scheme do app no ambiente atual (`vezzo-development`, `vezzo-preview` ou `vezzo`), definido em `app.config.ts`. */
function resolveScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  const value = Array.isArray(scheme) ? scheme[0] : scheme;
  return value || FALLBACK_SCHEME;
}

export const APP_SCHEME = resolveScheme();

/** Monta um deep link do app, ex.: `appUrl("reset-password")` -> `vezzo-development://reset-password`. */
export function appUrl(path = ""): string {
  return `${APP_SCHEME}://${path}`;
}
