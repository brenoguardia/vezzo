import { z } from "zod";
import { objectId, ymd } from "./common";

export const NOTE_MAX_LENGTH = 1000;
export const NOTES_PAGE_SIZE = 20;
export const NOTES_MAX_PAGE_SIZE = 50;

const text = z.string().trim().min(1).max(NOTE_MAX_LENGTH);

export const noteInput = z.object({ date: ymd, text });
export type NoteInput = z.infer<typeof noteInput>;

export const notePatch = z
  .object({ date: ymd, text })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Informe ao menos um campo");
export type NotePatch = z.infer<typeof notePatch>;

/** Paginação por deslocamento (`cursor` = quantas notas já foram lidas); suficiente para um diário pessoal. */
export const notesQuery = z.object({
  cursor: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(NOTES_MAX_PAGE_SIZE).default(NOTES_PAGE_SIZE),
});

export const noteDto = z.object({
  id: objectId,
  habitId: objectId,
  date: ymd,
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NoteDto = z.infer<typeof noteDto>;

export const notesPage = z.object({ notes: z.array(noteDto), nextCursor: z.number().nullable() });
export type NotesPage = z.infer<typeof notesPage>;
