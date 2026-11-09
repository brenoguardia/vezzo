import { describe, expect, it } from "@jest/globals";
import { type Gate, type GateInput, resolveGate } from "./guard";

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
