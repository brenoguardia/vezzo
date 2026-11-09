import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/storage";
import { type Accent, DEFAULT_ACCENT } from "@/shared/tokens";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeState {
  accent: Accent;
  mode: ThemeMode;
  setAccent: (accent: Accent) => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accent: DEFAULT_ACCENT,
      mode: "system",
      setAccent: (accent) => set({ accent }),
      setMode: (mode) => set({ mode }),
    }),
    { name: "vezzo-theme", storage: persistStorage },
  ),
);
