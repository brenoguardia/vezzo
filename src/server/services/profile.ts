import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { toProfileDto } from "@/server/mappers";
import type { ProfileDto, profileUpdate } from "@/shared/schemas";
import type { z } from "zod";

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export async function getProfile(db: Db, userId: string): Promise<ProfileDto> {
  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError("NOT_FOUND", "Perfil não encontrado.");
  return toProfileDto(profile);
}

export async function updateProfile(
  db: Db,
  userId: string,
  input: z.output<typeof profileUpdate>,
): Promise<ProfileDto> {
  await getProfile(db, userId);
  const updated = await db.profile.update({ where: { userId }, data: input });
  return toProfileDto(updated);
}

export async function timezoneOf(db: Db, userId: string): Promise<string> {
  const profile = await db.profile.findUnique({ where: { userId } });
  return profile?.timezone ?? DEFAULT_TIMEZONE;
}
