import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { HabitDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useSyncStore } from "@/store/sync";
import { clearHabitData, hydrateHabits } from "./hydrate";

const mockHabits = jest.fn<() => Promise<HabitDto[]>>();
const mockLogs = jest.fn<(from: string, to: string) => Promise<never[]>>();
jest.mock("@/api/summary", () => ({ fetchHabits: () => mockHabits() }));
jest.mock("@/api/logs", () => ({
  fetchLogs: (from: string, to: string) => mockLogs(from, to),
  postLogBatch: jest.fn(),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "00000000-0000-4000-8000-000000000001" }));

const habit = { id: "507f1f77bcf86cd799439011", name: "Água" } as HabitDto;

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

describe("clearHabitData", () => {
  it("zera hábitos e fila", () => {
    useHabitsStore.getState().hydrate([habit], []);
    useSyncStore.setState({ queue: [] });
    clearHabitData();
    expect(useHabitsStore.getState().habits).toEqual([]);
  });
});
