import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import { useHydrationStore } from "@/store/hydration";
import { retryDelay, useHabitsSync } from "./useHabitsSync";

const mockHydrate = jest.fn<(tz: string) => Promise<boolean>>();
jest.mock("./hydrate", () => ({ hydrateHabits: (tz: string) => mockHydrate(tz) }));
jest.mock("@react-native-community/netinfo", () => ({ addEventListener: () => () => {} }));

beforeEach(() => {
  jest.useFakeTimers();
  mockHydrate.mockReset();
  mockHydrate.mockResolvedValue(true);
  useHydrationStore.setState({ status: "idle" });
});
afterEach(() => {
  jest.useRealTimers();
});

describe("retryDelay", () => {
  it("dobra de 5 s até 60 s", () => {
    expect([0, 1, 2, 3, 4, 5].map(retryDelay)).toEqual([5000, 10000, 20000, 40000, 60000, 60000]);
  });
});

describe("useHabitsSync", () => {
  it("hidrata ao ativar e não repete enquanto não há erro", async () => {
    await renderHook(() => useHabitsSync(true, "UTC"));
    expect(mockHydrate).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(120000);
    });
    expect(mockHydrate).toHaveBeenCalledTimes(1);
  });

  it("depois de um erro tenta de novo sozinho, com recuo, até funcionar", async () => {
    await renderHook(() => useHabitsSync(true, "UTC"));
    await act(async () => useHydrationStore.setState({ status: "error" }));
    await act(async () => {
      jest.advanceTimersByTime(4999);
    });
    expect(mockHydrate).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(mockHydrate).toHaveBeenCalledTimes(2);
    // Falhou de novo: o próximo intervalo é de 10 s.
    await act(async () => useHydrationStore.setState({ status: "loading" }));
    await act(async () => useHydrationStore.setState({ status: "error" }));
    await act(async () => {
      jest.advanceTimersByTime(9999);
    });
    expect(mockHydrate).toHaveBeenCalledTimes(2);
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(mockHydrate).toHaveBeenCalledTimes(3);
    // Deu certo: para de tentar.
    await act(async () => useHydrationStore.setState({ status: "ready" }));
    await act(async () => {
      jest.advanceTimersByTime(120000);
    });
    expect(mockHydrate).toHaveBeenCalledTimes(3);
  });

  it("desligado (sem sessão nas abas) não hidrata nem tenta de novo", async () => {
    await renderHook(() => useHabitsSync(false, "UTC"));
    await act(async () => useHydrationStore.setState({ status: "error" }));
    await act(async () => {
      jest.advanceTimersByTime(120000);
    });
    expect(mockHydrate).not.toHaveBeenCalled();
  });
});
