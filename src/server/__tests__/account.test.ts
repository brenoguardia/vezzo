import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/v1/account+api";
import { db, installFakeSession, req, seedHabit, seedProfile, USER_A, USER_B } from "@/server/testing/harness";
import { accountDeleted } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});

async function seedAccount(userId: string) {
  await db.user.create({ data: { id: userId, name: userId, email: `${userId}@exemplo.com` } });
  await db.session.create({ data: { userId, token: `t-${userId}` } });
  await db.account.create({ data: { userId, providerId: "credential", accountId: userId } });
  await seedProfile(userId);
  const habit = await seedHabit(userId);
  await db.habitLog.create({ data: { habitId: habit.id, userId, date: "2026-11-05" } });
  await db.pushToken.create({ data: { userId, token: `push-${userId}`, platform: "ios" } });
}

const count = async (userId: string) => ({
  user: await db.user.count({ where: { id: userId } }),
  session: await db.session.count({ where: { userId } }),
  account: await db.account.count({ where: { userId } }),
  profile: await db.profile.count({ where: { userId } }),
  habit: await db.habit.count({ where: { userId } }),
  log: await db.habitLog.count({ where: { userId } }),
  push: await db.pushToken.count({ where: { userId } }),
});

describe("DELETE /v1/account", () => {
  it("exige sessão", async () => {
    expect((await DELETE(req("/api/v1/account", { method: "DELETE" }))).status).toBe(401);
  });

  it("remove todos os dados do usuário da sessão e preserva os de outros", async () => {
    await seedAccount(USER_A);
    await seedAccount(USER_B);
    const res = await DELETE(req("/api/v1/account", { user: USER_A, method: "DELETE" }));
    expect(res.status).toBe(200);
    expect(accountDeleted.parse(await res.json())).toEqual({ deleted: true });
    expect(await count(USER_A)).toEqual({ user: 0, session: 0, account: 0, profile: 0, habit: 0, log: 0, push: 0 });
    expect(await count(USER_B)).toEqual({ user: 1, session: 1, account: 1, profile: 1, habit: 1, log: 1, push: 1 });
  });

  it("ignora um userId vindo na query ou no corpo", async () => {
    await seedAccount(USER_A);
    await seedAccount(USER_B);
    await DELETE(req(`/api/v1/account?userId=${USER_B}`, { user: USER_A, method: "DELETE", body: { userId: USER_B } }));
    expect((await count(USER_B)).user).toBe(1);
  });

  it("pede login recente: sessão antiga recebe 403 e nada é apagado", async () => {
    await seedAccount(USER_A);
    const res = await DELETE(req("/api/v1/account", { user: USER_A, method: "DELETE", sessionAgeMin: 60 }));
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("REAUTH_REQUIRED");
    expect((await count(USER_A)).user).toBe(1);
    expect((await count(USER_A)).habit).toBe(1);
  });

  it("aceita login dentro da janela", async () => {
    await seedAccount(USER_A);
    const res = await DELETE(req("/api/v1/account", { user: USER_A, method: "DELETE", sessionAgeMin: 5 }));
    expect(res.status).toBe(200);
  });
});
