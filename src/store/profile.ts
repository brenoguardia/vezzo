import { create } from "zustand";
import { apiFetch } from "@/api/client";
import { updateProfile } from "@/api/profile";
import { applyPreferences } from "@/lib/theme-sync";
import { type ProfileDto, type ProfileUpdate, profileDto } from "@/shared/schemas";

type Status = "idle" | "loading" | "ready" | "error";

interface ProfileState {
  profile: ProfileDto | null;
  status: Status;
  load: () => Promise<void>;
  /** Grava no servidor (`PUT /v1/profile`) e atualiza o perfil local. Lança se a requisição falhar. */
  update: (patch: ProfileUpdate) => Promise<ProfileDto>;
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
      const profile = await apiFetch("/v1/profile", profileDto);
      applyPreferences(profile);
      set({ profile, status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },
  update: async (patch) => {
    const profile = await updateProfile(patch);
    set({ profile });
    return profile;
  },
  markOnboardingDone: (displayName) =>
    set((s) =>
      s.profile
        ? { profile: { ...s.profile, onboardingDone: true, displayName: displayName ?? s.profile.displayName } }
        : s,
    ),
  clear: () => set({ profile: null, status: "idle" }),
}));
