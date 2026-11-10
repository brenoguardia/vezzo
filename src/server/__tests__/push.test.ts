import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, POST } from "@/app/api/v1/push/register+api";
import { db, installFakeSession, req, USER_A, USER_B } from "@/server/testing/harness";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});

const TOKEN = "ExponentPushToken[abc123]";
const post = (user: string | undefined, body: unknown) =>
  POST(req("/api/v1/push/register", { user, method: "POST", body }));
const del = (user: string | undefined, body: unknown) =>
  DELETE(req("/api/v1/push/register", { user, method: "DELETE", body }));

describe("POST /v1/push/register", () => {
  it("exige sessão", async () => {
    expect((await post(undefined, { token: TOKEN, platform: "ios" })).status).toBe(401);
  });

  it("salva o token do usuário da sessão", async () => {
    expect((await post(USER_A, { token: TOKEN, platform: "ios" })).status).toBe(200);
    expect(await db.pushToken.findMany({ where: { userId: USER_A } })).toHaveLength(1);
  });

  it("é idempotente: repetir não duplica", async () => {
    await post(USER_A, { token: TOKEN, platform: "ios" });
    await post(USER_A, { token: TOKEN, platform: "ios" });
    expect(await db.pushToken.count({ where: { token: TOKEN } })).toBe(1);
  });

  it("aparelho que troca de conta passa o token para o novo usuário", async () => {
    await post(USER_A, { token: TOKEN, platform: "android" });
    await post(USER_B, { token: TOKEN, platform: "android" });
    expect(await db.pushToken.count({ where: { userId: USER_A } })).toBe(0);
    expect(await db.pushToken.count({ where: { userId: USER_B } })).toBe(1);
  });

  it.each([{ token: "qualquer-coisa", platform: "ios" }, { token: TOKEN, platform: "web" }, { token: TOKEN }, {}])(
    "rejeita corpo inválido %j",
    async (body) => {
      expect((await post(USER_A, body)).status).toBe(400);
    },
  );

  it("ignora userId enviado no corpo", async () => {
    await post(USER_A, { token: TOKEN, platform: "ios", userId: USER_B });
    expect(await db.pushToken.count({ where: { userId: USER_B } })).toBe(0);
  });
});

describe("DELETE /v1/push/register", () => {
  it("exige sessão", async () => {
    expect((await del(undefined, { token: TOKEN })).status).toBe(401);
  });

  it("remove o token do próprio usuário", async () => {
    await post(USER_A, { token: TOKEN, platform: "ios" });
    expect((await del(USER_A, { token: TOKEN })).status).toBe(200);
    expect(await db.pushToken.count({ where: { userId: USER_A } })).toBe(0);
  });

  it("não remove o token de outro usuário", async () => {
    await post(USER_A, { token: TOKEN, platform: "ios" });
    await del(USER_B, { token: TOKEN });
    expect(await db.pushToken.count({ where: { userId: USER_A } })).toBe(1);
  });
});
