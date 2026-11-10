import { useSyncExternalStore } from "react";
import { i18n, type Locale } from "./index";

function subscribe(listener: () => void) {
  return i18n.onChange(listener);
}

const current = (): Locale => (i18n.locale === "en" ? "en" : "pt-BR");

/** Re-renderiza o componente quando o idioma muda (`t()` sozinho não é reativo). */
export function useLocale(): Locale {
  // O 3º argumento é exigido na renderização do servidor (rotas web e `+api`): lá vale o idioma atual.
  return useSyncExternalStore(subscribe, current, current);
}
