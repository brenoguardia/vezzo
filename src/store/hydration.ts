import { create } from "zustand";

export type HydrationStatus = "idle" | "loading" | "ready" | "error";

interface HydrationState {
  status: HydrationStatus;
  set: (status: HydrationStatus) => void;
}

/** Estado da última hidratação dos hábitos (só em memória): alimenta skeletons e a faixa de erro de rede. */
export const useHydrationStore = create<HydrationState>()((set) => ({
  status: "idle",
  set: (status) => set({ status }),
}));
