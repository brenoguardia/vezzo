import * as Sentry from "@sentry/react-native";
import type { ComponentType } from "react";

/** DSN público do Sentry. Sem ele, o monitoramento fica desligado (dev, testes, builds sem conta). */
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const monitoringEnabled = Boolean(dsn);

const SENSITIVE = /(authorization|cookie|password|senha|token|secret|email)/i;

/** Remove cabeçalhos e campos sensíveis de um evento antes do envio (privacidade, docs/politica-de-privacidade). */
export function scrub<T extends Sentry.ErrorEvent>(event: T): T {
  if (event.request?.headers) {
    event.request.headers = Object.fromEntries(
      Object.entries(event.request.headers).filter(([key]) => !SENSITIVE.test(key)),
    );
  }
  delete event.request?.cookies;
  delete event.request?.data;
  delete event.user;
  return event;
}

/**
 * Crash reporting. Só erros e travamentos: sem rastreamento de desempenho, replay, screenshots
 * nem dados pessoais (`sendDefaultPii: false`, sem `setUser`). Não há analytics de produto.
 */
export function initMonitoring() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: __DEV__ ? "development" : "production",
    sendDefaultPii: false,
    tracesSampleRate: 0,
    attachScreenshot: false,
    attachViewHierarchy: false,
    enableAutoSessionTracking: true,
    beforeSend: scrub,
  });
}

/** Envolve o componente raiz para capturar erros de renderização; sem DSN, devolve-o intacto. */
export function withMonitoring<P extends Record<string, unknown>>(Root: ComponentType<P>): ComponentType<P> {
  return monitoringEnabled ? Sentry.wrap(Root) : Root;
}

/** Registra uma exceção tratada (ex.: falha de rede que o usuário não vê). No-op sem DSN. */
export function reportError(error: unknown) {
  if (monitoringEnabled) Sentry.captureException(error);
}
