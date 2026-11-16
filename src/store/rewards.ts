import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/storage";
import type { RewardProgressDto } from "@/shared/schemas";

interface RewardsState {
  /** Último progresso conhecido por hábito (o servidor calcula; aqui só há cache para abrir sem espera). */
  progress: Record<string, RewardProgressDto>;
  setProgress: (habitId: string, progress: RewardProgressDto) => void;
  remove: (habitId: string) => void;
  clear: () => void;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set) => ({
      progress: {},
      setProgress: (habitId, progress) => set((s) => ({ progress: { ...s.progress, [habitId]: progress } })),
      remove: (habitId) =>
        set((s) => {
          const { [habitId]: _removed, ...rest } = s.progress;
          return { progress: rest };
        }),
      clear: () => set({ progress: {} }),
    }),
    { name: "vezzo-rewards", storage: persistStorage, partialize: (s) => ({ progress: s.progress }) },
  ),
);
