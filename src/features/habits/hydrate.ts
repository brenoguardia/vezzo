import { fetchLogs } from "@/api/logs";
import { fetchHabits } from "@/api/summary";
import { reportError } from "@/lib/monitoring";
import { addDays, localDate } from "@/shared/dates";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useNotesStore } from "@/store/notes";
import { useRewardsStore } from "@/store/rewards";
import { syncEpoch, useSyncStore } from "@/store/sync";

export const HISTORY_DAYS = 90;
/** Tentativas de baixar um snapshot que não ficou obsoleto durante o GET. */
const MAX_SNAPSHOT_TRIES = 3;

/**
 * Sincroniza e hidrata (docs/09): primeiro envia a fila local, depois baixa hábitos e os últimos 90 dias.
 * Sem rede, mantém o cache persistido. Devolve `true` se hidratou.
 */
export async function hydrateHabits(timeZone: string, now = new Date()): Promise<boolean> {
  const status = useHydrationStore.getState().set;
  status("loading");
  try {
    const today = localDate(now, timeZone);
    for (let attempt = 1; ; attempt += 1) {
      if (!(await useSyncStore.getState().flush())) {
        status("error");
        return false;
      }
      const epoch = syncEpoch();
      const [habits, logs] = await Promise.all([fetchHabits(), fetchLogs(addDays(today, -HISTORY_DAYS), today)]);
      // O usuário agiu (ou um lote foi aplicado) durante o GET: o snapshot pode ser mais antigo que o estado local.
      // Baixa de novo; na última tentativa aplica mesmo assim (o store preserva o que ainda está na fila).
      if (epoch !== syncEpoch() && attempt < MAX_SNAPSHOT_TRIES) continue;
      useHabitsStore.getState().hydrate(habits, logs);
      status("ready");
      return true;
    }
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
  useRewardsStore.getState().clear();
  useNotesStore.getState().clear();
  useHydrationStore.getState().set("idle");
}
