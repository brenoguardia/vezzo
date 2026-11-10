import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pruneSnoozes, registerSnooze, type SnoozeCounts } from "@/lib/notifications/schedule";
import { persistStorage } from "@/lib/storage";

interface SnoozeState {
  counts: SnoozeCounts;
  register: (habitId: string, date: string) => void;
  clear: () => void;
}

/** Adiamentos por hábito e dia (máx. 3), persistidos no cliente: valem com o app em segundo plano e offline. */
export const useSnoozeStore = create<SnoozeState>()(
  persist(
    (set) => ({
      counts: {},
      register: (habitId, date) =>
        set((s) => ({ counts: registerSnooze(pruneSnoozes(s.counts, date), habitId, date) })),
      clear: () => set({ counts: {} }),
    }),
    { name: "vezzo-snooze", storage: persistStorage },
  ),
);
