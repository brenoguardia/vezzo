import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { AppState } from "react-native";
import { useSyncStore } from "@/store/sync";
import { hydrateHabits } from "./hydrate";

/** Hidrata ao entrar e reenvia a fila ao voltar para primeiro plano e ao recuperar a rede (docs/09). */
export function useHabitsSync(enabled: boolean, timeZone: string) {
  useEffect(() => {
    if (!enabled) return;
    void hydrateHabits(timeZone);
    const app = AppState.addEventListener("change", (state) => {
      if (state === "active") void hydrateHabits(timeZone);
    });
    let online: boolean | null = null;
    const net = NetInfo.addEventListener((state) => {
      const next = !!state.isConnected;
      if (next && online === false) void useSyncStore.getState().flush();
      online = next;
    });
    return () => {
      app.remove();
      net();
    };
  }, [enabled, timeZone]);
}
