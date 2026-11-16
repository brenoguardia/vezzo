import { create } from "zustand";
import type { NoteDto } from "@/shared/schemas";

export type HabitNotes = { notes: NoteDto[]; nextCursor: number | null };

/** Ordem da timeline: dia da anotação e, no mesmo dia, a mais recente primeiro. */
export const newestFirst = (a: NoteDto, b: NoteDto) =>
  a.date === b.date
    ? a.createdAt < b.createdAt
      ? 1
      : a.createdAt > b.createdAt
        ? -1
        : b.id.localeCompare(a.id)
    : a.date < b.date
      ? 1
      : -1;

interface NotesState {
  /** Anotações já carregadas por hábito. Exigem conexão, então não são persistidas. */
  byHabit: Record<string, HabitNotes>;
  setFirstPage: (habitId: string, page: HabitNotes) => void;
  appendPage: (habitId: string, page: HabitNotes) => void;
  upsert: (note: NoteDto) => void;
  remove: (habitId: string, noteId: string) => void;
  clear: () => void;
}

export const useNotesStore = create<NotesState>()((set) => ({
  byHabit: {},
  setFirstPage: (habitId, page) => set((s) => ({ byHabit: { ...s.byHabit, [habitId]: page } })),
  appendPage: (habitId, page) =>
    set((s) => {
      const current = s.byHabit[habitId]?.notes ?? [];
      const seen = new Set(current.map((n) => n.id));
      const merged = [...current, ...page.notes.filter((n) => !seen.has(n.id))];
      return { byHabit: { ...s.byHabit, [habitId]: { notes: merged, nextCursor: page.nextCursor } } };
    }),
  upsert: (note) =>
    set((s) => {
      const current = s.byHabit[note.habitId] ?? { notes: [], nextCursor: null };
      const notes = [...current.notes.filter((n) => n.id !== note.id), note].sort(newestFirst);
      return { byHabit: { ...s.byHabit, [note.habitId]: { ...current, notes } } };
    }),
  remove: (habitId, noteId) =>
    set((s) => {
      const current = s.byHabit[habitId];
      if (!current) return s;
      return {
        byHabit: { ...s.byHabit, [habitId]: { ...current, notes: current.notes.filter((n) => n.id !== noteId) } },
      };
    }),
  clear: () => set({ byHabit: {} }),
}));
