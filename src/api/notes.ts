import { z } from "zod";
import { apiFetch } from "@/api/client";
import { type NoteDto, type NoteInput, type NotePatch, type NotesPage, noteDto, notesPage } from "@/shared/schemas";

export function fetchNotes(habitId: string, cursor = 0, limit?: number): Promise<NotesPage> {
  const query = new URLSearchParams({ cursor: String(cursor), ...(limit ? { limit: String(limit) } : {}) });
  return apiFetch(`/v1/habits/${habitId}/notes?${query}`, notesPage);
}

export function createNote(habitId: string, input: NoteInput): Promise<NoteDto> {
  return apiFetch(`/v1/habits/${habitId}/notes`, noteDto, { method: "POST", body: JSON.stringify(input) });
}

export function patchNote(habitId: string, noteId: string, patch: NotePatch): Promise<NoteDto> {
  return apiFetch(`/v1/habits/${habitId}/notes/${noteId}`, noteDto, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function deleteNote(habitId: string, noteId: string): Promise<void> {
  await apiFetch(`/v1/habits/${habitId}/notes/${noteId}`, z.object({ ok: z.boolean() }), { method: "DELETE" });
}
