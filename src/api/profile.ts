import { apiFetch } from "@/api/client";
import { type ProfileDto, type ProfileUpdate, profileDto } from "@/shared/schemas";

/** `PUT /v1/profile`: devolve o perfil atualizado. */
export function updateProfile(input: ProfileUpdate): Promise<ProfileDto> {
  return apiFetch("/v1/profile", profileDto, { method: "PUT", body: JSON.stringify(input) });
}
