import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { getRewardProgress } from "@/server/services/rewards";

export const GET = withSession(async ({ userId, params }) => json(await getRewardProgress(prisma, userId, params.id)));
