import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { HabitDto, LogDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useSyncStore } from "@/store/sync";
import { clearHabitData, hydrateHabits } from "./hydrate";

const mockHabits = jest.fn<() => Promise<HabitDto[]>>();
const mockLogs = jest.fn<(from: string, to: string) => Promise<LogDto[]>>();
const mockPost = jest.fn<(items: unknown[]) => Promise<{ applied: LogDto[]; rejected: never[] }>>();
jest.mock("@/api/summary", () => ({ fetchHabits: () => mockHabits() }));
jest.mock("@/api/logs", () => ({
  fetchLogs: (from: string, to: string) => mockLogs(from, to),
  postLogBatch: (items: unknown[]) => mockPost(items),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "00000000-0000-4000-8000-000000000001" }));

const habit = { id: "507f1f77bcf86cd799439011", name: "Água", goalValue: 1, goalUnit: "BOOLEAN" } as HabitDto;
const DAY = "2026-11-09";
const NOW = new Date("2026-11-10T01:00:00Z");
const serverLog = (status: "DONE" | "PENDING"): LogDto => ({
  id: "507f1f77bcf86cd799439099",
  habitId: habit.id,
  date: DAY,
  value: status === "DONE" ? 1 : 0,
  status,
  source: "APP",
  completedAt: status === "DONE" ? "2026-11-09T12:12:00.000Z" : null,
  clientId: null,
});
const dayLog = () => useHabitsStore.getState().logs[`${habit.id}:${DAY}`];

beforeEach(() => {
  jest.clearAllMocks();
  clearHabitData();
});

describe("hydrateHabits", () => {
  it("baixa 90 dias no fuso do usuário e grava no store", async () => {
    mockHabits.mockResolvedValue([habit]);
    mockLogs.mockResolvedValue([]);
    const ok = await hydrateHabits("America/Sao_Paulo", new Date("2026-11-10T01:00:00Z"));
    expect(ok).toBe(true);
    expect(mockLogs).toHaveBeenCalledWith("2026-08-11", "2026-11-09");
    expect(useHabitsStore.getState().habits).toEqual([habit]);
    expect(useHydrationStore.getState().status).toBe("ready");
  });

  it("offline: mantém o cache", async () => {
    useHabitsStore.getState().hydrate([habit], []);
    mockHabits.mockRejectedValue(new Error("offline"));
    mockLogs.mockResolvedValue([]);
    expect(await hydrateHabits("UTC")).toBe(false);
    expect(useHabitsStore.getState().habits).toEqual([habit]);
    expect(useHydrationStore.getState().status).toBe("error");
  });
});

describe("hidratação durante toques do usuário", () => {
  const deferred = <T>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  };
  const tick = () => new Promise((r) => setTimeout(r, 0));

  it("GET em voo com Marcar e Desmarcar: o estado local não é revertido", async () => {
    mockHabits.mockResolvedValue([habit]);
    mockPost.mockResolvedValue({ applied: [], rejected: [] });
    useHabitsStore.getState().hydrate([habit], []);
    const first = deferred<LogDto[]>();
    mockLogs.mockReturnValueOnce(first.promise);
    mockLogs.mockResolvedValue([serverLog("PENDING")]);

    const run = hydrateHabits("America/Sao_Paulo", NOW);
    await tick();
    useHabitsStore.getState().toggleDone(habit.id, DAY); // Marcar
    useHabitsStore.getState().toggleDone(habit.id, DAY); // Desmarcar
    first.resolve([serverLog("DONE")]); // snapshot antigo chega depois dos toques
    expect(await run).toBe(true);

    expect(dayLog()).toMatchObject({ status: "PENDING", value: 0 });
    expect(mockLogs.mock.calls.length).toBeGreaterThan(1); // baixou de novo
  });

  it("POST aplicado durante o GET: o snapshot antigo não deixa DONE preso", async () => {
    mockHabits.mockResolvedValue([habit]);
    useHabitsStore.getState().hydrate([habit], []);
    const first = deferred<LogDto[]>();
    mockLogs.mockReturnValueOnce(first.promise);
    mockLogs.mockResolvedValue([serverLog("PENDING")]);
    // O servidor aplica o Desmarcar (PENDING) enquanto o GET antigo ainda não voltou.
    mockPost.mockResolvedValue({ applied: [serverLog("PENDING")], rejected: [] });

    const run = hydrateHabits("America/Sao_Paulo", NOW);
    await tick(); // o GET está em voo
    useHabitsStore.getState().toggleDone(habit.id, DAY);
    useHabitsStore.getState().toggleDone(habit.id, DAY);
    await useSyncStore.getState().flush(); // o POST aplica o Desmarcar e a fila esvazia durante o voo
    expect(useSyncStore.getState().queue).toEqual([]);
    first.resolve([serverLog("DONE")]);
    expect(await run).toBe(true);

    expect(dayLog()).toMatchObject({ status: "PENDING", value: 0 });
  });
});

describe("clearHabitData", () => {
  it("zera hábitos e fila", () => {
    useHabitsStore.getState().hydrate([habit], []);
    useSyncStore.setState({ queue: [] });
    clearHabitData();
    expect(useHabitsStore.getState().habits).toEqual([]);
  });
});
