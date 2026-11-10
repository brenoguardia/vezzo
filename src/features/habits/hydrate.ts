import { fetchLogs } from "@/api/logs";
import { fetchHabits } from "@/api/summary";
import { reportError } from "@/lib/monitoring";
import { addDays, localDate } from "@/shared/dates";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useSyncStore } from "@/store/sync";

export const HISTORY_DAYS = 90;

/**
 * Sincroniza e hidrata (docs/09): primeiro envia a fila local, depois baixa hábitos e os últimos 90 dias.
 * Sem rede, mantém o cache persistido. Devolve `true` se hidratou.
 */
export async function hydrateHabits(timeZone: string, now = new Date()): Promise<boolean> {
  const status = useHydrationStore.getState().set;
  status("loading");
  if (!(await useSyncStore.getState().flush())) {
    status("error");
    return false;
  }
  try {
    const today = localDate(now, timeZone);
    const [habits, logs] = await Promise.all([fetchHabits(), fetchLogs(addDays(today, -HISTORY_DAYS), today)]);
    useHabitsStore.getState().hydrate(habits, logs);
    status("ready");
    return true;
  } catch (error) {
    // Sem isso a faixa de erro não diz o motivo (rede, servidor, resposta fora do schema).
    if (__DEV__) console.warn("[hydrate] falhou:", error);
    reportError(error);
    status("error");
    return false;
  }
}

/** Logout: limpa dados do usuário (não o tema). */
export function clearHabitData() {
  useHabitsStore.getState().clear();
  useSyncStore.getState().clear();
  useHydrationStore.getState().set("idle");
}
