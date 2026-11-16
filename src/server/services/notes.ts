import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { toNoteDto } from "@/server/mappers";
import { findOwnedHabit } from "@/server/services/habits";
import { timezoneOf } from "@/server/services/profile";
import { localDate } from "@/shared/dates";
import { type NoteDto, type NoteInput, type NotePatch, type NotesPage, objectId } from "@/shared/schemas";

/** Mais recentes primeiro: por dia da anotação e, no mesmo dia, pela ordem em que foram escritas. */
const NEWEST_FIRST = [{ date: "desc" as const }, { createdAt: "desc" as const }, { id: "desc" as const }];

async function assertNotFuture(db: Db, userId: string, date: string, now: Date) {
  if (date > localDate(now, await timezoneOf(db, userId))) {
    throw new ApiError("VALIDATION_ERROR", "Dados inválidos.", { date: "A data não pode ser futura." });
  }
}

async function findOwnedNote(db: Db, userId: string, habitId: string, noteId: string) {
  const note = objectId.safeParse(noteId).success
    ? await db.habitNote.findFirst({ where: { id: noteId, habitId, userId } })
    : null;
  if (!note) throw new ApiError("NOT_FOUND", "Anotação não encontrada.");
  return note;
}

export async function listNotes(
  db: Db,
  userId: string,
  habitId: string,
  cursor: number,
  limit: number,
): Promise<NotesPage> {
  const habit = await findOwnedHabit(db, userId, habitId);
  const rows = await db.habitNote.findMany({
    where: { habitId: habit.id, userId },
    orderBy: NEWEST_FIRST,
    skip: cursor,
    take: limit + 1,
  });
  const hasMore = rows.length > limit;
  return { notes: rows.slice(0, limit).map(toNoteDto), nextCursor: hasMore ? cursor + limit : null };
}

export async function createNote(
  db: Db,
  userId: string,
  habitId: string,
  input: NoteInput,
  now = new Date(),
): Promise<NoteDto> {
  const habit = await findOwnedHabit(db, userId, habitId);
  await assertNotFuture(db, userId, input.date, now);
  const note = await db.habitNote.create({ data: { habitId: habit.id, userId, date: input.date, text: input.text } });
  return toNoteDto(note);
}

export async function updateNote(
  db: Db,
  userId: string,
  habitId: string,
  noteId: string,
  patch: NotePatch,
  now = new Date(),
): Promise<NoteDto> {
  await findOwnedHabit(db, userId, habitId);
  await findOwnedNote(db, userId, habitId, noteId);
  if (patch.date) await assertNotFuture(db, userId, patch.date, now);
  const note = await db.habitNote.update({ where: { id: noteId, userId }, data: patch });
  return toNoteDto(note);
}

export async function deleteNote(db: Db, userId: string, habitId: string, noteId: string): Promise<void> {
  await findOwnedHabit(db, userId, habitId);
  await findOwnedNote(db, userId, habitId, noteId);
  await db.habitNote.deleteMany({ where: { id: noteId, habitId, userId } });
}
