import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { createNote, listNotes } from "@/server/services/notes";
import { noteInput, notesQuery } from "@/shared/schemas";

export const GET = withSession(async ({ userId, params, query }) => {
  const { cursor, limit } = query(notesQuery);
  return json(await listNotes(prisma, userId, params.id, cursor, limit));
});

export const POST = withSession(async ({ userId, params, body }) =>
  json(await createNote(prisma, userId, params.id, await body(noteInput)), { status: 201 }),
);
