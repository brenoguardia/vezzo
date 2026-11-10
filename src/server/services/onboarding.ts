import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { toHabitDto, toProfileDto } from "@/server/mappers";
import { notArchived } from "@/server/services/habits";
import type { OnboardingResult, onboardingComplete } from "@/shared/schemas";

/**
 * Grava nome + hábitos escolhidos e marca `onboardingDone` numa transação (docs/03).
 * Idempotente: se o onboarding já foi concluído (ex.: resposta perdida e reenvio), devolve o estado atual.
 */
export async function completeOnboarding(
  db: Db,
  userId: string,
  input: z.output<typeof onboardingComplete>,
): Promise<OnboardingResult> {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) throw new ApiError("NOT_FOUND", "Perfil não encontrado.");

    if (profile.onboardingDone) {
      const habits = await tx.habit.findMany({ where: { userId, ...notArchived }, orderBy: { order: "asc" } });
      return { profile: toProfileDto(profile), habits: habits.map(toHabitDto) };
    }

    const slugs = [...new Set(input.habits.flatMap((h) => (h.templateSlug ? [h.templateSlug] : [])))];
    const templates = await tx.habitTemplate.findMany({ where: { slug: { in: slugs } } });
    const templateIds = new Map(templates.map((t) => [t.slug, t.id]));
    const unknown: Record<string, string> = {};
    input.habits.forEach((h, i) => {
      if (h.templateSlug && !templateIds.has(h.templateSlug))
        unknown[`habits.${i}.templateSlug`] = "Atividade desconhecida";
    });
    if (Object.keys(unknown).length > 0) throw new ApiError("VALIDATION_ERROR", "Dados inválidos.", unknown);

    const base = await tx.habit.count({ where: { userId, ...notArchived } });
    const habits = [];
    for (const [i, { templateSlug, ...fields }] of input.habits.entries()) {
      habits.push(
        await tx.habit.create({
          data: {
            ...fields,
            userId,
            templateId: templateSlug ? (templateIds.get(templateSlug) ?? null) : null,
            order: base + i,
            archivedAt: null,
          },
        }),
      );
    }
    const updated = await tx.profile.update({
      where: { userId },
      data: { displayName: input.displayName, onboardingDone: true },
    });
    return { profile: toProfileDto(updated), habits: habits.map(toHabitDto) };
  });
}
