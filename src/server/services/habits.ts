import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { toHabitDto } from "@/server/mappers";
import { objectId, type HabitDto, type HabitInput, type habitPatch } from "@/shared/schemas";
import type { z } from "zod";

/** Busca o hábito somente se pertencer ao usuário; caso contrário, 404. */
export async function findOwnedHabit(db: Db, userId: string, id: string) {
  const habit = objectId.safeParse(id).success
    ? await db.habit.findFirst({ where: { id, userId } })
    : null;
  if (!habit) throw new ApiError("NOT_FOUND", "Hábito não encontrado.");
  return habit;
}

export async function listHabits(db: Db, userId: string): Promise<HabitDto[]> {
  const habits = await db.habit.findMany({
    where: { userId, archivedAt: null },
    orderBy: { order: "asc" },
  });
  return habits.map(toHabitDto);
}

export async function createHabit(db: Db, userId: string, input: HabitInput): Promise<HabitDto> {
  const { templateSlug, ...fields } = input;
  let templateId: string | null = null;
  if (templateSlug) {
    const template = await db.habitTemplate.findUnique({ where: { slug: templateSlug } });
    if (!template) {
      throw new ApiError("VALIDATION_ERROR", "Dados inválidos.", { templateSlug: "Atividade desconhecida" });
    }
    templateId = template.id;
  }
  const order = await db.habit.count({ where: { userId, archivedAt: null } });
  const habit = await db.habit.create({ data: { ...fields, userId, templateId, order } });
  return toHabitDto(habit);
}

export async function updateHabit(
  db: Db,
  userId: string,
  id: string,
  patch: z.output<typeof habitPatch>,
): Promise<HabitDto> {
  await findOwnedHabit(db, userId, id);
  const habit = await db.habit.update({ where: { id, userId }, data: patch });
  return toHabitDto(habit);
}

/** Arquiva (preserva histórico) ou, com `hard`, exclui hábito e logs. */
export async function removeHabit(db: Db, userId: string, id: string, hard: boolean): Promise<void> {
  await findOwnedHabit(db, userId, id);
  if (hard) {
    await db.habitLog.deleteMany({ where: { habitId: id, userId } });
    await db.habit.deleteMany({ where: { id, userId } });
  } else {
    await db.habit.update({ where: { id, userId }, data: { archivedAt: new Date() } });
  }
}
