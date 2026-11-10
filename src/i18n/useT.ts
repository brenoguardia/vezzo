import { useMemo } from "react";
import { i18n } from "./index";
import { useLocale } from "./useLocale";

export type TFunction = (key: string, options?: Record<string, string | number>) => string;

/**
 * `t` reativo para componentes. Devolve uma função com identidade nova a cada idioma, o que
 * invalida a memoização do React Compiler: chamar `t()` importado de `@/i18n` num componente é
 * tratado como puro e fica preso ao primeiro idioma, mesmo que o componente assine `useLocale()`.
 */
export function useT(): TFunction {
  const locale = useLocale();
  return useMemo<TFunction>(() => (key, options) => i18n.t(key, { ...options, locale }), [locale]);
}
