import type { z } from "zod";
import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { toHabitDto } from "@/server/mappers";
import { timezoneOf } from "@/server/services/profile";
import { localDate } from "@/shared/dates";
import {
  type HabitCreate,
  type HabitDto,
  type HabitInput,
  type habitPatch,
  objectId,
  type RewardInput,
} from "@/shared/schemas";

/** Busca o hábito somente se pertencer ao usuário; caso contrário, 404. */
export async function findOwnedHabit(db: Db, userId: string, id: string) {
  const habit = objectId.safeParse(id).success ? await db.habit.findFirst({ where: { id, userId } }) : null;
  if (!habit) throw new ApiError("NOT_FOUND", "Hábito não encontrado.");
  return habit;
}

/**
 * Hábitos não arquivados. No Prisma + MongoDB, `archivedAt: null` só casa com o campo gravado como
 * null; hábitos criados sem o campo (o Prisma não grava opcionais omitidos) ficariam de fora.
 */
export const notArchived = { OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] };

export async function listHabits(db: Db, userId: string, includeArchived = false): Promise<HabitDto[]> {
  const habits = await db.habit.findMany({
    where: includeArchived ? { userId } : { userId, ...notArchived },
    orderBy: { order: "asc" },
  });
  return habits.map(toHabitDto);
}

/** Campos de presente gravados no hábito. O início é a data local de ativação e não muda ao editar. */
function rewardData(reward: RewardInput | null | undefined, startDate: string | null) {
  if (!reward) {
    return { rewardTitle: null, rewardEmoji: null, rewardDays: null, rewardStartDate: null, rewardClaimedAt: null };
  }
  return {
    rewardTitle: reward.title,
    rewardEmoji: reward.emoji,
    rewardDays: reward.days,
    ...(startDate ? { rewardStartDate: startDate } : {}),
  };
}

export async function createHabit(
  db: Db,
  userId: string,
  input: HabitCreate | HabitInput,
  now = new Date(),
): Promise<HabitDto> {
  const { templateSlug, reward, ...fields } = input as HabitCreate;
  let templateId: string | null = null;
  if (templateSlug) {
    const template = await db.habitTemplate.findUnique({ where: { slug: templateSlug } });
    if (!template) {
      throw new ApiError("VALIDATION_ERROR", "Dados inválidos.", { templateSlug: "Atividade desconhecida" });
    }
    templateId = template.id;
  }
  const order = await db.habit.count({ where: { userId, ...notArchived } });
  const startDate = reward ? localDate(now, await timezoneOf(db, userId)) : null;
  const data = {
    ...fields,
    ...(reward ? rewardData(reward, startDate) : {}),
    userId,
    templateId,
    order,
    archivedAt: null,
  };
  const habit = await db.habit.create({ data });
  return toHabitDto(habit);
}

export async function updateHabit(
  db: Db,
  userId: string,
  id: string,
  patch: z.output<typeof habitPatch>,
  now = new Date(),
): Promise<HabitDto> {
  const current = await findOwnedHabit(db, userId, id);
  const { archived, reward, ...fields } = patch;
  const data: Record<string, unknown> = { ...fields };
  if (reward !== undefined) {
    // Mantém o início do desafio ao editar; só um presente novo (ou reativado) começa hoje.
    const startDate = current.rewardStartDate ?? (reward ? localDate(now, await timezoneOf(db, userId)) : null);
    Object.assign(data, rewardData(reward, startDate));
  }
  if (archived === true) data.archivedAt = new Date();
  if (archived === false) {
    // Volta ao fim da lista dos ativos.
    data.archivedAt = null;
    if (current.archivedAt) data.order = await db.habit.count({ where: { userId, ...notArchived } });
  }
  const habit = await db.habit.update({ where: { id, userId }, data });
  return toHabitDto(habit);
}

/** Arquiva (preserva histórico) ou, com `hard`, exclui hábito e logs. */
export async function removeHabit(db: Db, userId: string, id: string, hard: boolean): Promise<void> {
  await findOwnedHabit(db, userId, id);
  if (hard) {
    await db.habitNote.deleteMany({ where: { habitId: id, userId } });
    await db.habitLog.deleteMany({ where: { habitId: id, userId } });
    await db.habit.deleteMany({ where: { id, userId } });
  } else {
    await db.habit.update({ where: { id, userId }, data: { archivedAt: new Date() } });
  }
}
