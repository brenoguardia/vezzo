import { beforeEach, describe, expect, it } from "@jest/globals";
import { DEFAULT_SELECTION } from "@/shared/onboarding";
import { useOnboardingStore } from "./onboarding";

beforeEach(() => useOnboardingStore.getState().reset());

const state = () => useOnboardingStore.getState();

describe("useOnboardingStore", () => {
  it("começa sem nome e com os quatro hábitos pré-selecionados", () => {
    expect(state().displayName).toBe("");
    expect(state().selected).toEqual(DEFAULT_SELECTION);
  });

  it("setName guarda o nome", () => {
    state().setName("Ana");
    expect(state().displayName).toBe("Ana");
  });

  it("toggle seleciona com os padrões do catálogo e desmarca ao repetir", () => {
    state().toggle("diario");
    expect(state().selected.diario).toEqual({ goalValue: 1, days: [0, 1, 2, 3, 4, 5, 6] });
    state().toggle("diario");
    expect(state().selected.diario).toBeUndefined();
  });

  it("toggle ignora slug fora do catálogo", () => {
    state().toggle("fantasma");
    expect(state().selected.fantasma).toBeUndefined();
  });

  it("setGoal e setDays alteram só o hábito selecionado", () => {
    state().setGoal("ler", 25);
    state().setDays("ler", [5, 1]);
    expect(state().selected.ler).toEqual({ goalValue: 25, days: [1, 5] });
    state().setGoal("diario", 3);
    expect(state().selected.diario).toBeUndefined();
  });

  it("reabrir um hábito desmarcado volta aos padrões", () => {
    state().setGoal("ler", 25);
    state().toggle("ler");
    state().toggle("ler");
    expect(state().selected.ler?.goalValue).toBe(15);
  });

  it("reset limpa nome e seleção", () => {
    state().setName("Ana");
    state().toggle("diario");
    state().reset();
    expect(state().displayName).toBe("");
    expect(state().selected).toEqual(DEFAULT_SELECTION);
  });
});
