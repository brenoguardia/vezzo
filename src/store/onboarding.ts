import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/storage";
import { DEFAULT_SELECTION, defaultsOf, findTemplate, type Selection } from "@/shared/onboarding";

interface OnboardingState {
  displayName: string;
  selected: Selection;
  setName: (name: string) => void;
  toggle: (slug: string) => void;
  setGoal: (slug: string, goalValue: number) => void;
  setDays: (slug: string, days: number[]) => void;
  reset: () => void;
}

const initial = () => ({
  displayName: "",
  selected: Object.fromEntries(
    Object.entries(DEFAULT_SELECTION).map(([slug, v]) => [slug, { ...v, days: [...v.days] }]),
  ),
});

/** Onboarding em andamento. Persistido até concluir (docs/09); `reset()` roda ao finalizar. */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial(),
      setName: (displayName) => set({ displayName }),
      toggle: (slug) =>
        set((s) => {
          if (s.selected[slug]) {
            const { [slug]: _removed, ...rest } = s.selected;
            return { selected: rest };
          }
          const template = findTemplate(slug);
          return template ? { selected: { ...s.selected, [slug]: defaultsOf(template) } } : s;
        }),
      setGoal: (slug, goalValue) =>
        set((s) => {
          const current = s.selected[slug];
          return current ? { selected: { ...s.selected, [slug]: { ...current, goalValue } } } : s;
        }),
      setDays: (slug, days) =>
        set((s) => {
          const current = s.selected[slug];
          return current
            ? { selected: { ...s.selected, [slug]: { ...current, days: [...days].sort((a, b) => a - b) } } }
            : s;
        }),
      reset: () => set(initial()),
    }),
    { name: "vezzo-onboarding", storage: persistStorage },
  ),
);
