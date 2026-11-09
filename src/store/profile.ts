import { create } from "zustand";
import { apiFetch } from "@/api/client";
import { type ProfileDto, profileDto } from "@/shared/schemas";

type Status = "idle" | "loading" | "ready" | "error";

interface ProfileState {
  profile: ProfileDto | null;
  status: Status;
  load: () => Promise<void>;
  markOnboardingDone: (displayName?: string) => void;
  clear: () => void;
}

/** Perfil do servidor (inclui `onboardingDone`, usado pela guarda de rotas). Não persiste. */
export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  status: "idle",
  load: async () => {
    set({ status: "loading" });
    try {
      set({ profile: await apiFetch("/v1/profile", profileDto), status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },
  markOnboardingDone: (displayName) =>
    set((s) =>
      s.profile ? { profile: { ...s.profile, onboardingDone: true, displayName: displayName ?? s.profile.displayName } } : s,
    ),
  clear: () => set({ profile: null, status: "idle" }),
}));
