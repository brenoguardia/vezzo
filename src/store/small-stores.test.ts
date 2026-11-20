import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NoteDto, RewardProgressDto } from "@/shared/schemas";
import { newestFirst, useNotesStore } from "./notes";
import { useRewardsStore } from "./rewards";
import { useSnoozeStore } from "./snooze";
import { useToastStore } from "./toast";

const note = (id: string, date: string, createdAt: string, habitId = "h1"): NoteDto => ({
  id,
  habitId,
  date,
  text: `nota ${id}`,
  createdAt,
  updatedAt: createdAt,
});

const progress = (overrides: Partial<RewardProgressDto> = {}): RewardProgressDto => ({
  state: "ACTIVE",
  currentRun: 3,
  daysLeft: 87,
  percent: 0.03,
  best: 3,
  attempts: 1,
  runStart: "2026-11-01",
  achievedDate: null,
  ...overrides,
});

beforeEach(() => {
  useNotesStore.getState().clear();
  useRewardsStore.getState().clear();
  useSnoozeStore.getState().clear();
  useToastStore.getState().hide();
});

describe("toast", () => {
  it("mostra e esconde a mensagem", () => {
    useToastStore.getState().show("Salvo");
    expect(useToastStore.getState().message).toBe("Salvo");
    useToastStore.getState().hide();
    expect(useToastStore.getState().message).toBeNull();
  });
});

describe("snooze", () => {
  it("conta adiamentos por hábito e dia", () => {
    const { register } = useSnoozeStore.getState();
    register("h1", "2026-11-10");
    register("h1", "2026-11-10");
    register("h2", "2026-11-10");
    expect(useSnoozeStore.getState().counts).toEqual({
      h1: { date: "2026-11-10", count: 2 },
      h2: { date: "2026-11-10", count: 1 },
    });
  });

  it("um novo dia recomeça a contagem e descarta dias antigos", () => {
    const { register } = useSnoozeStore.getState();
    register("h1", "2026-11-05");
    register("h2", "2026-11-10");
    expect(useSnoozeStore.getState().counts.h1).toBeUndefined();
    register("h2", "2026-11-11");
    expect(useSnoozeStore.getState().counts.h2).toEqual({ date: "2026-11-11", count: 1 });
  });
});

describe("rewards", () => {
  it("guarda o último progresso por hábito e remove só o pedido", () => {
    const { setProgress, remove } = useRewardsStore.getState();
    setProgress("h1", progress());
    setProgress("h2", progress({ currentRun: 9 }));
    setProgress("h1", progress({ currentRun: 4 }));
    expect(useRewardsStore.getState().progress.h1?.currentRun).toBe(4);
    remove("h1");
    expect(Object.keys(useRewardsStore.getState().progress)).toEqual(["h2"]);
  });
});

describe("notes", () => {
  it("newestFirst: dia mais recente primeiro e, no mesmo dia, a criada por último", () => {
    const a = note("a", "2026-11-09", "2026-11-09T10:00:00.000Z");
    const b = note("b", "2026-11-10", "2026-11-10T08:00:00.000Z");
    const c = note("c", "2026-11-10", "2026-11-10T09:00:00.000Z");
    expect([a, b, c].sort(newestFirst).map((n) => n.id)).toEqual(["c", "b", "a"]);
  });

  it("upsert insere, substitui pelo id e mantém a ordem", () => {
    const { upsert } = useNotesStore.getState();
    upsert(note("a", "2026-11-09", "2026-11-09T10:00:00.000Z"));
    upsert(note("b", "2026-11-10", "2026-11-10T10:00:00.000Z"));
    upsert({ ...note("a", "2026-11-09", "2026-11-09T10:00:00.000Z"), text: "editada" });
    const notes = useNotesStore.getState().byHabit.h1?.notes ?? [];
    expect(notes.map((n) => n.id)).toEqual(["b", "a"]);
    expect(notes[1]?.text).toBe("editada");
  });

  it("appendPage não duplica anotações já carregadas e guarda o cursor", () => {
    const { setFirstPage, appendPage } = useNotesStore.getState();
    const a = note("a", "2026-11-10", "2026-11-10T10:00:00.000Z");
    const b = note("b", "2026-11-09", "2026-11-09T10:00:00.000Z");
    setFirstPage("h1", { notes: [a], nextCursor: 1 });
    appendPage("h1", { notes: [a, b], nextCursor: null });
    expect(useNotesStore.getState().byHabit.h1).toEqual({ notes: [a, b], nextCursor: null });
  });

  it("remove apaga só a anotação pedida e ignora hábito desconhecido", () => {
    const { upsert, remove } = useNotesStore.getState();
    upsert(note("a", "2026-11-10", "2026-11-10T10:00:00.000Z"));
    upsert(note("b", "2026-11-09", "2026-11-09T10:00:00.000Z"));
    remove("h1", "a");
    expect(useNotesStore.getState().byHabit.h1?.notes.map((n) => n.id)).toEqual(["b"]);
    expect(() => remove("nao-existe", "x")).not.toThrow();
  });
});
