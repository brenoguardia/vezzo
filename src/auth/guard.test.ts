import { describe, expect, it } from "@jest/globals";
import { type Gate, type GateInput, resolveGate, resolveProfileStatus, shouldHideSplash } from "./guard";

const base: GateInput = { sessionPending: false, hasSession: false, profileStatus: "idle", onboardingDone: false };

describe("resolveGate", () => {
  const cases: [string, Partial<GateInput>, Gate][] = [
    ["sessão carregando", { sessionPending: true }, "loading"],
    ["sem sessão", {}, "auth"],
    ["com sessão e perfil ainda não buscado", { hasSession: true }, "loading"],
    ["perfil carregando", { hasSession: true, profileStatus: "loading" }, "loading"],
    ["perfil falhou", { hasSession: true, profileStatus: "error" }, "error"],
    ["onboarding pendente", { hasSession: true, profileStatus: "ready" }, "onboarding"],
    ["onboarding concluído", { hasSession: true, profileStatus: "ready", onboardingDone: true }, "tabs"],
  ];
  it.each(cases)("%s", (_, input, gate) => {
    expect(resolveGate({ ...base, ...input })).toBe(gate);
  });
});

describe("resolveProfileStatus", () => {
  it("cache do mesmo usuário vale como pronto, mesmo sem rede", () => {
    for (const status of ["idle", "loading", "error"] as const) {
      expect(resolveProfileStatus({ status, hasProfile: true, ownerId: "u1", userId: "u1" })).toBe("ready");
    }
  });

  it("cache de outro usuário nunca vale", () => {
    expect(resolveProfileStatus({ status: "ready", hasProfile: true, ownerId: "u1", userId: "u2" })).toBe("loading");
    expect(resolveProfileStatus({ status: "idle", hasProfile: true, ownerId: "u1", userId: "u2" })).toBe("idle");
  });

  it("sem cache vale o estado da requisição", () => {
    expect(resolveProfileStatus({ status: "loading", hasProfile: false, ownerId: null, userId: "u1" })).toBe("loading");
    expect(resolveProfileStatus({ status: "error", hasProfile: false, ownerId: null, userId: "u1" })).toBe("error");
  });

  it("sem sessão o cache não conta", () => {
    expect(resolveProfileStatus({ status: "idle", hasProfile: true, ownerId: "u1", userId: undefined })).toBe("idle");
  });
});

describe("shouldHideSplash", () => {
  const base = { fontsReady: true, gate: "loading" as Gate, isPublicRoute: false, timedOut: false };
  it("segura enquanto o gate carrega", () => {
    expect(shouldHideSplash(base)).toBe(false);
  });
  it("segura sem fontes, mesmo com o gate resolvido", () => {
    expect(shouldHideSplash({ ...base, fontsReady: false, gate: "tabs" })).toBe(false);
  });
  it("sai quando o gate resolve", () => {
    for (const gate of ["auth", "onboarding", "tabs", "error"] as const) {
      expect(shouldHideSplash({ ...base, gate })).toBe(true);
    }
  });
  it("sai no limite de tempo ou em rota pública", () => {
    expect(shouldHideSplash({ ...base, timedOut: true })).toBe(true);
    expect(shouldHideSplash({ ...base, isPublicRoute: true })).toBe(true);
  });
});
