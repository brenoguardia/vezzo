import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "@/store/theme";
import { type Accent, buildTheme, type ThemeScheme, type ThemeTokens } from "@/shared/tokens";

interface ThemeOverride {
  scheme: ThemeScheme;
  accent: Accent;
}

const OverrideContext = createContext<ThemeOverride | null>(null);

/** Força modo e cor para a subárvore (playground, prévia da tela de tema). */
export function ThemeOverrideProvider({
  scheme,
  accent,
  children,
}: ThemeOverride & { children: ReactNode }) {
  const value = useMemo(() => ({ scheme, accent }), [scheme, accent]);
  return <OverrideContext.Provider value={value}>{children}</OverrideContext.Provider>;
}

/** Resolve os tokens (docs/06) a partir de cor de destaque + modo + esquema do sistema. */
export function useTheme(): ThemeTokens {
  const override = useContext(OverrideContext);
  const accent = useThemeStore((s) => s.accent);
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();

  const scheme: ThemeScheme = override?.scheme ?? (mode === "system" ? (system === "light" ? "light" : "dark") : mode);
  const acc = override?.accent ?? accent;
  return useMemo(() => buildTheme(scheme, acc), [scheme, acc]);
}
