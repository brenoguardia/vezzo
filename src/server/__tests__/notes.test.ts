import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE as deleteAccount } from "@/app/api/v1/account+api";
import { PATCH as editNote, DELETE as removeNote } from "@/app/api/v1/habits/[id]/notes/[noteId]+api";
import { POST as addNote, GET as listNotes } from "@/app/api/v1/habits/[id]/notes/index+api";
import { DELETE as removeHabit } from "@/app/api/v1/habits/[id]+api";
import { db, installFakeSession, req, seedHabit, seedProfile, USER_A, USER_B } from "@/server/testing/harness";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});

const post = (user: string, id: string, body: unknown) => addNote(req("/x", { user, method: "POST", body }), { id });
const list = async (user: string, id: string, qs = "") => (await listNotes(req(`/x${qs}`, { user }), { id })).json();

describe("anotações do hábito", () => {
  it("cria, lista (mais recentes primeiro) e agrupa por dia", async () => {
    await seedProfile(USER_A);
    const habit = await seedHabit(USER_A);
    const id = habit.id as string;
    await post(USER_A, id, { date: "2020-01-01", text: "primeira" });
    await post(USER_A, id, { date: "2020-01-03", text: "terceira" });
    await post(USER_A, id, { date: "2020-01-01", text: "segunda no mesmo dia" });
    const { notes, nextCursor } = await list(USER_A, id);
    expect(notes.map((n: { text: string }) => n.text)).toEqual(["terceira", "segunda no mesmo dia", "primeira"]);
    expect(nextCursor).toBeNull();
  });

  it("pagina por cursor", async () => {
    await seedProfile(USER_A);
    const id = (await seedHabit(USER_A)).id as string;
    for (const day of ["01", "02", "03", "04", "05"]) await post(USER_A, id, { date: `2020-01-${day}`, text: day });
    const first = await list(USER_A, id, "?limit=2");
    expect(first.notes.map((n: { text: string }) => n.text)).toEqual(["05", "04"]);
    expect(first.nextCursor).toBe(2);
    const last = await list(USER_A, id, `?limit=2&cursor=4`);
    expect(last.notes.map((n: { text: string }) => n.text)).toEqual(["01"]);
    expect(last.nextCursor).toBeNull();
  });

  it("valida texto vazio, texto longo, data inválida e data futura", async () => {
    await seedProfile(USER_A);
    const id = (await seedHabit(USER_A)).id as string;
    for (const body of [
      { date: "2020-01-01", text: "   " },
      { date: "2020-01-01", text: "x".repeat(1001) },
      { date: "01/01/2020", text: "oi" },
      { date: "2999-01-01", text: "do futuro" },
    ]) {
      expect((await post(USER_A, id, body)).status).toBe(400);
    }
    expect((await list(USER_A, id)).notes).toEqual([]);
  });

  it("edita e exclui", async () => {
    await seedProfile(USER_A);
    const id = (await seedHabit(USER_A)).id as string;
    const created = await (await post(USER_A, id, { date: "2020-01-01", text: "antes" })).json();
    const edited = await editNote(req("/x", { user: USER_A, method: "PATCH", body: { text: "depois" } }), {
      id,
      noteId: created.id,
    });
    expect((await edited.json()).text).toBe("depois");
    const gone = await removeNote(req("/x", { user: USER_A, method: "DELETE" }), { id, noteId: created.id });
    expect(gone.status).toBe(200);
    expect(await db.habitNote.count()).toBe(0);
  });

  it("não aceita PATCH vazio", async () => {
    await seedProfile(USER_A);
    const id = (await seedHabit(USER_A)).id as string;
    const created = await (await post(USER_A, id, { date: "2020-01-01", text: "a" })).json();
    const res = await editNote(req("/x", { user: USER_A, method: "PATCH", body: {} }), { id, noteId: created.id });
    expect(res.status).toBe(400);
  });
});

describe("isolamento das anotações", () => {
  it("B não lista, cria, edita nem exclui anotações do hábito de A", async () => {
    await seedProfile(USER_A);
    await seedProfile(USER_B);
    const id = (await seedHabit(USER_A)).id as string;
    const note = await (await post(USER_A, id, { date: "2020-01-01", text: "segredo" })).json();

    expect((await listNotes(req("/x", { user: USER_B }), { id })).status).toBe(404);
    expect((await post(USER_B, id, { date: "2020-01-01", text: "invasão" })).status).toBe(404);
    const patch = await editNote(req("/x", { user: USER_B, method: "PATCH", body: { text: "hack" } }), {
      id,
      noteId: note.id,
    });
    expect(patch.status).toBe(404);
    const del = await removeNote(req("/x", { user: USER_B, method: "DELETE" }), { id, noteId: note.id });
    expect(del.status).toBe(404);
    expect(await db.habitNote.count()).toBe(1);
    expect((await db.habitNote.findMany())[0]).toMatchObject({ text: "segredo" });
  });

  it("não alcança a anotação de outro hábito do mesmo usuário pela URL errada", async () => {
    await seedProfile(USER_A);
    const one = (await seedHabit(USER_A)).id as string;
    const two = (await seedHabit(USER_A, { name: "Outro" })).id as string;
    const note = await (await post(USER_A, one, { date: "2020-01-01", text: "do primeiro" })).json();
    const res = await removeNote(req("/x", { user: USER_A, method: "DELETE" }), { id: two, noteId: note.id });
    expect(res.status).toBe(404);
  });

  it("sem sessão responde 401", async () => {
    const id = "0000000000000000000000aa";
    expect((await listNotes(req("/x"), { id })).status).toBe(401);
    expect((await addNote(req("/x", { method: "POST", body: {} }), { id })).status).toBe(401);
    expect((await editNote(req("/x", { method: "PATCH", body: {} }), { id, noteId: id })).status).toBe(401);
    expect((await removeNote(req("/x", { method: "DELETE" }), { id, noteId: id })).status).toBe(401);
  });
});

describe("limpeza de dados", () => {
  it("excluir o hábito de vez apaga as anotações dele", async () => {
    await seedProfile(USER_A);
    const id = (await seedHabit(USER_A)).id as string;
    await post(USER_A, id, { date: "2020-01-01", text: "x" });
    await removeHabit(req("/x?hard=true", { user: USER_A, method: "DELETE" }), { id });
    expect(await db.habitNote.count()).toBe(0);
  });

  it("excluir a conta apaga as anotações do usuário e preserva as de outros", async () => {
    await seedProfile(USER_A);
    await seedProfile(USER_B);
    const a = (await seedHabit(USER_A)).id as string;
    const b = (await seedHabit(USER_B)).id as string;
    await post(USER_A, a, { date: "2020-01-01", text: "a" });
    await post(USER_B, b, { date: "2020-01-01", text: "b" });
    const res = await deleteAccount(req("/x", { user: USER_A, method: "DELETE" }));
    expect(res.status).toBe(200);
    expect((await db.habitNote.findMany()).map((n) => n.userId)).toEqual([USER_B]);
  });
});
