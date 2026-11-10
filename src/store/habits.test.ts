import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { HabitDto, LogDto } from "@/shared/schemas";
import { logKey, useHabitsStore } from "./habits";
import { useSyncStore } from "./sync";

jest.mock("expo-crypto", () => {
  let n = 0;
  return { randomUUID: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}` };
});
jest.mock("@/api/logs", () => ({ postLogBatch: jest.fn(() => new Promise(() => {})) }));

const ID = "507f1f77bcf86cd799439011";
const habit = (over: Partial<HabitDto> = {}): HabitDto => ({
  id: ID,
  templateId: null,
  name: "Água",
  emoji: "💧",
  goalValue: 2.5,
  goalUnit: "LITERS",
  days: [0, 1, 2, 3, 4, 5, 6],
  reminders: [],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  ...over,
});
const D = "2026-11-10";
const state = () => useHabitsStore.getState();
const queue = () => useSyncStore.getState().queue;

beforeEach(() => {
  useHabitsStore.getState().clear();
  useSyncStore.setState({ queue: [] });
  state().hydrate([habit()], []);
});

describe("toggleDone", () => {
  it("marca como feito com o valor da meta e enfileira", () => {
    state().toggleDone(ID, D);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "DONE", value: 2.5 });
    expect(queue()).toHaveLength(1);
    expect(queue()[0]).toMatchObject({ habitId: ID, date: D, status: "DONE", source: "APP" });
  });

  it("desmarca ao tocar de novo", () => {
    state().toggleDone(ID, D);
    state().toggleDone(ID, D);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "PENDING", value: 0 });
    expect(queue()).toHaveLength(1);
    expect(queue()[0]?.status).toBe("PENDING");
  });
});

describe("addValue", () => {
  it("soma parcial e conclui ao atingir a meta", () => {
    state().addValue(ID, D, 1);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "PENDING", value: 1 });
    state().addValue(ID, D, 1.5);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "DONE", value: 2.5 });
  });

  it("nunca fica negativo", () => {
    state().addValue(ID, D, -3);
    expect(state().logs[logKey(ID, D)]?.value).toBe(0);
  });
});

describe("skip", () => {
  it("pula preservando o progresso", () => {
    state().addValue(ID, D, 1);
    state().skip(ID, D);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "SKIPPED", value: 1 });
  });
});

describe("applyLog", () => {
  it("registra a origem NOTIFICATION", () => {
    state().applyLog(ID, D, { status: "DONE" }, "NOTIFICATION");
    expect(queue()[0]?.source).toBe("NOTIFICATION");
  });
  it("ignora hábito desconhecido", () => {
    state().applyLog("000000000000000000000000", D, { status: "DONE" });
    expect(queue()).toHaveLength(0);
  });
});

describe("hábitos", () => {
  it("upsertHabit insere e atualiza", () => {
    state().upsertHabit(habit({ id: "a".repeat(24), name: "Ler" }));
    state().upsertHabit(habit({ name: "Beber água" }));
    expect(state().habits.map((h) => h.name)).toEqual(["Beber água", "Ler"]);
  });

  it("archiveHabit marca archivedAt", () => {
    state().archiveHabit(ID, "2026-11-10T10:00:00.000Z");
    expect(state().habits[0]?.archivedAt).toBe("2026-11-10T10:00:00.000Z");
  });

  it("removeHabit apaga hábito, logs e ids agendados", () => {
    state().toggleDone(ID, D);
    state().setScheduledIds(ID, ["x"]);
    state().removeHabit(ID);
    expect(state().habits).toEqual([]);
    expect(state().logs).toEqual({});
    expect(state().scheduledIds).toEqual({});
  });
});

describe("mergeServerLogs", () => {
  const server = (over: Partial<LogDto> = {}): LogDto => ({
    id: "507f1f77bcf86cd799439099",
    habitId: ID,
    date: D,
    value: 2.5,
    status: "DONE",
    source: "APP",
    completedAt: null,
    clientId: null,
    ...over,
  });

  it("servidor vence para o mesmo hábito+data", () => {
    state().addValue(ID, D, 1);
    useSyncStore.setState({ queue: [] });
    state().mergeServerLogs([server()]);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "DONE", value: 2.5 });
  });

  it("não sobrescreve alteração local ainda na fila", () => {
    state().addValue(ID, D, 1);
    state().mergeServerLogs([server()]);
    expect(state().logs[logKey(ID, D)]).toMatchObject({ status: "PENDING", value: 1 });
  });
});

describe("clear", () => {
  it("limpa dados", () => {
    state().toggleDone(ID, D);
    state().clear();
    expect(state().habits).toEqual([]);
    expect(state().logs).toEqual({});
  });
});

describe("selectedHabitId", () => {
  it("guarda a seleção e limpa ao arquivar, remover ou limpar tudo", () => {
    state().selectHabit(ID);
    expect(state().selectedHabitId).toBe(ID);
    state().archiveHabit(ID);
    expect(state().selectedHabitId).toBeNull();
    state().selectHabit(ID);
    state().removeHabit(ID);
    expect(state().selectedHabitId).toBeNull();
    state().selectHabit(ID);
    state().clear();
    expect(state().selectedHabitId).toBeNull();
  });
});
