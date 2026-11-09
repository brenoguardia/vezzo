import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { getProfile, updateProfile } from "@/server/services/profile";
import { profileUpdate } from "@/shared/schemas";

export const GET = withSession(async ({ userId }) => json(await getProfile(prisma, userId)));

export const PUT = withSession(async ({ userId, body }) =>
  json(await updateProfile(prisma, userId, await body(profileUpdate))),
);
