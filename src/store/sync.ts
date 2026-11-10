import { create } from "zustand";
import { persist } from "zustand/middleware";
import { postLogBatch } from "@/api/logs";
import { persistStorage } from "@/lib/storage";
import type { LogDto, LogUpsert } from "@/shared/schemas";

const BATCH_SIZE = 200;
const DEBOUNCE_MS = 1000;

/** Atraso do reenvio: 2 s, dobrando até 60 s (docs/09). `failures` começa em 1. */
export const backoffDelay = (failures: number) => Math.min(2000 * 2 ** (failures - 1), 60000);

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
      enqueue: (item) => {
        set((s) => ({
          queue: [...s.queue.filter((q) => !(q.habitId === item.habitId && q.date === item.date)), item],
        }));
        schedule(DEBOUNCE_MS);
      },
      flush: () => {
        if (flushing) return flushing;
        flushing = (async () => {
          try {
            while (get().queue.length > 0) {
              const batch = get().queue.slice(0, BATCH_SIZE);
              const result = await postLogBatch(batch);
              const sent = new Set(batch.map((b) => b.clientId));
              // Remove só o que foi enviado: itens novos (ou substituídos) durante o envio ficam.
              set((s) => ({ queue: s.queue.filter((q) => !sent.has(q.clientId)) }));
              if (result.applied.length) listeners.forEach((fn) => fn(result.applied));
            }
            failures = 0;
            set({ lastSyncAt: new Date().toISOString() });
            return true;
          } catch {
            failures += 1;
            schedule(backoffDelay(failures));
            return false;
          } finally {
            flushing = null;
          }
        })();
        return flushing;
      },
      clear: () => {
        clearTimeout(timer);
        failures = 0;
        set({ queue: [], lastSyncAt: undefined });
      },
    }),
    { name: "vezzo-sync", storage: persistStorage, partialize: (s) => ({ queue: s.queue, lastSyncAt: s.lastSyncAt }) },
  ),
);
