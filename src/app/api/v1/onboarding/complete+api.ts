import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { completeOnboarding } from "@/server/services/onboarding";
import { onboardingComplete } from "@/shared/schemas";

export const POST = withSession(async ({ userId, body }) =>
  json(await completeOnboarding(prisma, userId, await body(onboardingComplete))),
);
