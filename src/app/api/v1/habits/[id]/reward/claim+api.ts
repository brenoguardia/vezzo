import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { claimReward } from "@/server/services/rewards";

export const POST = withSession(async ({ userId, params }) => json(await claimReward(prisma, userId, params.id)));
