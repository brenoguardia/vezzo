import { setLocale } from "@/i18n";
import { ACCENTS, type Accent } from "@/shared/tokens";
import type { ProfileDto } from "@/shared/schemas";
import { type ThemeMode, useThemeStore } from "@/store/theme";

type ApiMode = ProfileDto["themeMode"];

const TO_STORE: Record<ApiMode, ThemeMode> = { DARK: "dark", LIGHT: "light", SYSTEM: "system" };
const TO_API: Record<ThemeMode, ApiMode> = { dark: "DARK", light: "LIGHT", system: "SYSTEM" };

export const modeFromApi = (mode: ApiMode): ThemeMode => TO_STORE[mode];
export const modeToApi = (mode: ThemeMode): ApiMode => TO_API[mode];

export const isAccent = (value: string): value is Accent => (ACCENTS as readonly string[]).includes(value);

/**
 * Aplica as preferências salvas no servidor (cor, modo, idioma) ao aparelho.
 * Antes do onboarding o idioma do perfil é só o padrão do banco, então vale o do aparelho.
 */
export function applyPreferences(profile: Pick<ProfileDto, "accent" | "themeMode" | "language" | "onboardingDone">): void {
  const theme = useThemeStore.getState();
  if (isAccent(profile.accent)) theme.setAccent(profile.accent);
  theme.setMode(modeFromApi(profile.themeMode));
  if (profile.onboardingDone) setLocale(profile.language);
}
