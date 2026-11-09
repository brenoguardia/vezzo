import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, installFakeSession, req, seedProfile, USER_A, USER_B } from "@/server/testing/harness";
import { GET, PUT } from "@/app/api/v1/profile+api";
import { profileDto } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});


describe("GET /v1/profile", () => {
  it("exige sessão", async () => {
    expect((await GET(req("/api/v1/profile"))).status).toBe(401);
  });
  it("devolve o perfil da sessão", async () => {
    await seedProfile(USER_A, { displayName: "Ana" });
    await seedProfile(USER_B, { displayName: "Bia" });
    const res = await GET(req("/api/v1/profile", { user: USER_A }));
    expect(profileDto.parse(await res.json()).displayName).toBe("Ana");
  });
  it("responde 404 sem perfil", async () => {
    const res = await GET(req("/api/v1/profile", { user: USER_A }));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("NOT_FOUND");
  });
});

describe("PUT /v1/profile", () => {
  it("atualiza apenas os campos enviados", async () => {
    await seedProfile(USER_A, { displayName: "Ana" });
    const res = await PUT(
      req("/api/v1/profile", { user: USER_A, method: "PUT", body: { accent: "#3fbf9f", themeMode: "DARK", timezone: "UTC" } }),
    );
    const body = profileDto.parse(await res.json());
    expect(body).toMatchObject({ displayName: "Ana", accent: "#3fbf9f", themeMode: "DARK", timezone: "UTC" });
  });
  it("rejeita cor fora da paleta e fuso inválido", async () => {
    await seedProfile(USER_A);
    const res = await PUT(
      req("/api/v1/profile", { user: USER_A, method: "PUT", body: { accent: "#000000", timezone: "Marte/Olimpo" } }),
    );
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(Object.keys(error.fields).sort()).toEqual(["accent", "timezone"]);
  });
  it("ignora userId e onboardingDone vindos do corpo", async () => {
    await seedProfile(USER_A, { displayName: "Ana" });
    await seedProfile(USER_B, { displayName: "Bia" });
    await PUT(
      req("/api/v1/profile", {
        user: USER_A,
        method: "PUT",
        body: { userId: USER_B, onboardingDone: true, displayName: "Nova" },
      }),
    );
    const [a] = await db.profile.findMany({ where: { userId: USER_A } });
    const [b] = await db.profile.findMany({ where: { userId: USER_B } });
    expect(a).toMatchObject({ displayName: "Nova", onboardingDone: false });
    expect(b).toMatchObject({ displayName: "Bia" });
  });
});
