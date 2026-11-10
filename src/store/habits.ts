import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/storage";
import { deriveLog, type LogStatus, logKey } from "@/shared/logs";
import type { HabitDto, LogDto } from "@/shared/schemas";
import { onLogsApplied, useSyncStore } from "./sync";

export type DayLog = { value: number; status: LogStatus; completedAt?: string | null };
export type LogSourceKind = "APP" | "NOTIFICATION";
type LogChange = { value?: number; status?: LogStatus };

export { logKey };

interface HabitsState {
  habits: HabitDto[];
  logs: Record<string, DayLog>;
  scheduledIds: Record<string, string[]>;
  /** Hábito aberto no painel de detalhe do modo dual; fica no store para sobreviver à rotação (docs/08). */
  selectedHabitId: string | null;
  selectHabit: (id: string | null) => void;
  hydrate: (habits: HabitDto[], logs: LogDto[]) => void;
  /** Regra única de gravação: atualização otimista local + fila de sincronização. */
  applyLog: (habitId: string, date: string, change: LogChange, source?: LogSourceKind) => void;
  toggleDone: (habitId: string, date: string) => void;
  addValue: (habitId: string, date: string, delta: number) => void;
  skip: (habitId: string, date: string) => void;
  upsertHabit: (habit: HabitDto) => void;
  archiveHabit: (id: string, archivedAt?: string) => void;
  removeHabit: (id: string) => void;
  setScheduledIds: (habitId: string, ids: string[]) => void;
  mergeServerLogs: (logs: LogDto[]) => void;
  clear: () => void;
}

const empty = () => ({
  habits: [] as HabitDto[],
  logs: {} as Record<string, DayLog>,
  scheduledIds: {} as Record<string, string[]>,
});

/** Hábitos, logs dos últimos 90 dias e ids de notificações agendadas (docs/09). Persistido. */
export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      ...empty(),
      selectedHabitId: null,
      selectHabit: (selectedHabitId) => set({ selectedHabitId }),
      hydrate: (habits, logs) =>
        set({
          habits,
          logs: Object.fromEntries(
            logs.map((l) => [
              logKey(l.habitId, l.date),
              { value: l.value, status: l.status, completedAt: l.completedAt },
            ]),
          ),
        }),
      applyLog: (habitId, date, change, source = "APP") => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const key = logKey(habitId, date);
        const existing = get().logs[key];
        const next = deriveLog(habit, change, existing);
        const completedAt = next.status === "DONE" ? (existing?.completedAt ?? new Date().toISOString()) : null;
        set((s) => ({ logs: { ...s.logs, [key]: { ...next, completedAt } } }));
        useSyncStore.getState().enqueue({
          clientId: randomUUID(),
          habitId,
          date,
          value: next.value,
          status: next.status,
          source,
        });
      },
      toggleDone: (habitId, date) => {
        const current = get().logs[logKey(habitId, date)];
        get().applyLog(habitId, date, { status: current?.status === "DONE" ? "PENDING" : "DONE" });
      },
      addValue: (habitId, date, delta) => {
        const current = get().logs[logKey(habitId, date)]?.value ?? 0;
        get().applyLog(habitId, date, { value: Math.max(0, Math.round((current + delta) * 1000) / 1000) });
      },
      skip: (habitId, date) => get().applyLog(habitId, date, { status: "SKIPPED" }),
      upsertHabit: (habit) =>
        set((s) =>
          s.habits.some((h) => h.id === habit.id)
            ? { habits: s.habits.map((h) => (h.id === habit.id ? habit : h)) }
            : { habits: [...s.habits, habit] },
        ),
      archiveHabit: (id, archivedAt = new Date().toISOString()) =>
        set((s) => ({
          selectedHabitId: s.selectedHabitId === id ? null : s.selectedHabitId,
          habits: s.habits.map((h) => (h.id === id ? { ...h, archivedAt } : h)),
        })),
      removeHabit: (id) =>
        set((s) => {
          const { [id]: _ids, ...scheduledIds } = s.scheduledIds;
          return {
            selectedHabitId: s.selectedHabitId === id ? null : s.selectedHabitId,
            habits: s.habits.filter((h) => h.id !== id),
            logs: Object.fromEntries(Object.entries(s.logs).filter(([k]) => !k.startsWith(`${id}:`))),
            scheduledIds,
          };
        }),
      setScheduledIds: (habitId, ids) => set((s) => ({ scheduledIds: { ...s.scheduledIds, [habitId]: ids } })),
      mergeServerLogs: (incoming) => {
        const pending = new Set(useSyncStore.getState().queue.map((q) => logKey(q.habitId, q.date)));
        set((s) => {
          const logs = { ...s.logs };
          for (const l of incoming) {
            const key = logKey(l.habitId, l.date);
            if (!pending.has(key)) logs[key] = { value: l.value, status: l.status, completedAt: l.completedAt };
          }
          return { logs };
        });
      },
      clear: () => set({ ...empty(), selectedHabitId: null }),
    }),
    {
      name: "vezzo-habits",
      storage: persistStorage,
      partialize: (s) => ({ habits: s.habits, logs: s.logs, scheduledIds: s.scheduledIds }),
    },
  ),
);

// O servidor resolve conflitos por `updatedAt`: o que ele aplicou vence o estado local já sincronizado.
onLogsApplied((logs) => useHabitsStore.getState().mergeServerLogs(logs));
