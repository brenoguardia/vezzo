import { create } from "zustand";
import { persist } from "zustand/middleware";
import { postLogBatch } from "@/api/logs";
import { reportError } from "@/lib/monitoring";
import { persistStorage } from "@/lib/storage";
import type { LogDto, LogUpsert } from "@/shared/schemas";

const BATCH_SIZE = 200;
const DEBOUNCE_MS = 1000;

/** Atraso do reenvio: 2 s, dobrando até 60 s (docs/09). `failures` começa em 1. */
export const backoffDelay = (failures: number) =>
  Math.min(2000 * 2 ** (failures - 1), 60000);

type AppliedListener = (logs: LogDto[]) => void;
const listeners = new Set<AppliedListener>();
/** Recebe os logs que o servidor aplicou (resolve conflitos: vence o servidor). */
export const onLogsApplied = (fn: AppliedListener) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

interface SyncState {
  queue: LogUpsert[];
  lastSyncAt?: string;
  /** `true` quando o último envio falhou (sem rede ou servidor fora); some no próximo sucesso. Não persiste. */
  failed: boolean;
  /** Substitui item pendente do mesmo hábito+data: só o último estado importa. */
  enqueue: (item: LogUpsert) => void;
  /** Envia a fila em lotes. `true` se terminou sem erro. */
  flush: () => Promise<boolean>;
  clear: () => void;
}

let flushing: Promise<boolean> | null = null;
let failures = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

function schedule(delay: number) {
  clearTimeout(timer);
  timer = setTimeout(() => void useSyncStore.getState().flush(), delay);
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      lastSyncAt: undefined,
      failed: false,
      enqueue: (item) => {
        set((s) => ({
          queue: [
            ...s.queue.filter(
              (q) => !(q.habitId === item.habitId && q.date === item.date),
            ),
            item,
          ],
        }));
        schedule(DEBOUNCE_MS);
      },
      flush: () => {
        if (flushing) return flushing;
        const run = (async () => {
          try {
            while (get().queue.length > 0) {
              const batch = get().queue.slice(0, BATCH_SIZE);
              const result = await postLogBatch(batch);
              const sent = new Set(batch.map((b) => b.clientId));
              // Remove só o que foi enviado: itens novos (ou substituídos) durante o envio ficam.
              set((s) => ({
                queue: s.queue.filter((q) => !sent.has(q.clientId)),
              }));
              if (result.applied.length)
                listeners.forEach((fn) => fn(result.applied));
            }
            failures = 0;
            set({ lastSyncAt: new Date().toISOString(), failed: false });
            return true;
          } catch (error) {
            if (__DEV__) console.warn("[sync] envio falhou:", error);
            reportError(error);
            failures += 1;
            set({ failed: true });
            schedule(backoffDelay(failures));
            return false;
          }
        })();
        flushing = run;
        // Libera depois da atribuição: com a fila vazia o corpo acima termina de forma síncrona,
        // e um `finally` interno rodaria antes de `flushing = run`, deixando-o preso para sempre.
        void run.finally(() => {
          if (flushing === run) flushing = null;
        });
        return run;
      },
      clear: () => {
        clearTimeout(timer);
        failures = 0;
        set({ queue: [], lastSyncAt: undefined, failed: false });
      },
    }),
    {
      name: "vezzo-sync",
      storage: persistStorage,
      partialize: (s) => ({ queue: s.queue, lastSyncAt: s.lastSyncAt }),
    },
  ),
);
