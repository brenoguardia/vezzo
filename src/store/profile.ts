import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/api/client";
import { updateProfile } from "@/api/profile";
import { persistStorage } from "@/lib/storage";
import { applyPreferences } from "@/lib/theme-sync";
import { type ProfileDto, type ProfileUpdate, profileDto } from "@/shared/schemas";

type Status = "idle" | "loading" | "ready" | "error";

interface ProfileState {
  profile: ProfileDto | null;
  /** Usuário dono do perfil guardado: um perfil em cache nunca vale para outra conta. */
  ownerId: string | null;
  status: Status;
  /** Busca o perfil. Com cache do mesmo usuário, revalida em segundo plano (o gate não espera a rede). */
  load: (userId: string) => Promise<void>;
  /** Grava no servidor (`PUT /v1/profile`) e atualiza o perfil local. Lança se a requisição falhar. */
  update: (patch: ProfileUpdate) => Promise<ProfileDto>;
  markOnboardingDone: (displayName?: string) => void;
  clear: () => void;
}

/**
 * Perfil do servidor (inclui `onboardingDone`, usado pela guarda de rotas). Persiste `profile` e
 * `ownerId` para a próxima abertura a frio resolver o gate sem esperar a rede.
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      ownerId: null,
      status: "idle",
      load: async (userId) => {
        const cached = get().profile !== null && get().ownerId === userId;
        if (!cached) set({ profile: null, ownerId: userId, status: "loading" });
        try {
          const profile = await apiFetch("/v1/profile", profileDto);
          applyPreferences(profile);
          set({ profile, ownerId: userId, status: "ready" });
        } catch {
          // Com cache, falha de rede não derruba o app: segue com o perfil guardado.
          if (!cached) set({ status: "error" });
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
      clear: () => set({ profile: null, ownerId: null, status: "idle" }),
    }),
    {
      name: "vezzo-profile",
      storage: persistStorage,
      partialize: (s) => ({ profile: s.profile, ownerId: s.ownerId }),
    },
  ),
);
