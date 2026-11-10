import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useHydrationStore } from "@/store/hydration";
import { hydrateHabits } from "./hydrate";

/** Espera antes de tentar de novo depois de uma falha: 5 s, dobrando até 60 s. */
export const retryDelay = (attempt: number) => Math.min(5000 * 2 ** attempt, 60000);

/**
 * Hidrata ao entrar, ao voltar para primeiro plano e ao recuperar a rede (docs/09). Se a
 * hidratação falhar, tenta de novo sozinha com recuo: a faixa de erro da Hoje some assim que
 * o servidor responde, em vez de ficar até a próxima abertura do app.
 */
export function useHabitsSync(enabled: boolean, timeZone: string) {
  const status = useHydrationStore((s) => s.status);
  const attempts = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    void hydrateHabits(timeZone);
    const app = AppState.addEventListener("change", (state) => {
      if (state === "active") void hydrateHabits(timeZone);
    });
    let online: boolean | null = null;
    const net = NetInfo.addEventListener((state) => {
      const next = !!state.isConnected;
      // `hydrateHabits` envia a fila antes de baixar os dados.
      if (next && online === false) void hydrateHabits(timeZone);
      online = next;
    });
    return () => {
      app.remove();
      net();
    };
  }, [enabled, timeZone]);

  useEffect(() => {
    if (!enabled) return;
    if (status === "ready") {
      attempts.current = 0;
      return;
    }
    if (status !== "error") return;
    const timer = setTimeout(() => {
      attempts.current += 1;
      void hydrateHabits(timeZone);
    }, retryDelay(attempts.current));
    return () => clearTimeout(timer);
  }, [enabled, status, timeZone]);
}
