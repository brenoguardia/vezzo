import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { deleteNote, updateNote } from "@/server/services/notes";
import { notePatch } from "@/shared/schemas";

export const PATCH = withSession(async ({ userId, params, body }) =>
  json(await updateNote(prisma, userId, params.id, params.noteId, await body(notePatch))),
);

export const DELETE = withSession(async ({ userId, params }) => {
  await deleteNote(prisma, userId, params.id, params.noteId);
  return json({ ok: true });
});
