import { useCallback, useEffect, useState } from "react";
import { createNote, deleteNote, fetchNotes, patchNote } from "@/api/notes";
import type { NoteInput, NotePatch } from "@/shared/schemas";
import { useNotesStore } from "@/store/notes";

const EMPTY = { notes: [], nextCursor: null } as const;

/** Anotações de um hábito: carrega a primeira página ao abrir e as demais sob demanda. */
export function useNotes(habitId: string | undefined, pageSize?: number) {
  const data = useNotesStore((s) => (habitId ? s.byHabit[habitId] : undefined));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!habitId) return;
    let live = true;
    fetchNotes(habitId, 0, pageSize).then(
      (page) => {
        if (!live) return;
        useNotesStore.getState().setFirstPage(habitId, page);
        setError(false);
      },
      () => live && setError(true),
    );
    return () => {
      live = false;
    };
  }, [habitId, pageSize]);

  const loadMore = useCallback(async () => {
    const cursor = habitId ? useNotesStore.getState().byHabit[habitId]?.nextCursor : null;
    if (!habitId || cursor === null || cursor === undefined) return;
    setLoadingMore(true);
    try {
      useNotesStore.getState().appendPage(habitId, await fetchNotes(habitId, cursor, pageSize));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [habitId, pageSize]);

  // Falhas de gravação sobem para o chamador (o compositor mostra o erro e mantém o texto).
  const create = useCallback(
    async (input: NoteInput) => {
      if (habitId) useNotesStore.getState().upsert(await createNote(habitId, input));
    },
    [habitId],
  );
  const update = useCallback(
    async (noteId: string, patch: NotePatch) => {
      if (habitId) useNotesStore.getState().upsert(await patchNote(habitId, noteId, patch));
    },
    [habitId],
  );
  const remove = useCallback(
    async (noteId: string) => {
      if (!habitId) return;
      await deleteNote(habitId, noteId);
      useNotesStore.getState().remove(habitId, noteId);
    },
    [habitId],
  );

  const { notes, nextCursor } = data ?? EMPTY;
  // Primeira carga: ainda sem dados e sem erro.
  const loading = loadingMore || (!!habitId && !data && !error);
  return { notes, hasMore: nextCursor !== null, loading, error, loadMore, create, update, remove };
}
