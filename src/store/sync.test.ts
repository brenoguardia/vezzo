import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { LogUpsert } from "@/shared/schemas";
import { backoffDelay, useSyncStore } from "./sync";

const mockPost = jest.fn<(items: LogUpsert[]) => Promise<{ applied: unknown[]; rejected: unknown[] }>>();
jest.mock("@/api/logs", () => ({ postLogBatch: (items: LogUpsert[]) => mockPost(items) }));

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const item = (n: number, habitId = "h1", date = "2026-11-10"): LogUpsert => ({
  clientId: id(n),
  habitId,
  date,
  status: "DONE",
  source: "APP",
});

beforeEach(() => {
  jest.clearAllMocks();
  useSyncStore.setState({ queue: [], lastSyncAt: undefined });
});

describe("backoffDelay", () => {
  it("dobra de 2 s até 60 s", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(backoffDelay)).toEqual([2000, 4000, 8000, 16000, 32000, 60000, 60000]);
  });
});

describe("enqueue", () => {
  it("mantém só o último item por hábito+data", () => {
    useSyncStore.getState().enqueue(item(1));
    useSyncStore.getState().enqueue(item(2));
    useSyncStore.getState().enqueue(item(3, "h2"));
    expect(useSyncStore.getState().queue.map((q) => q.clientId)).toEqual([id(2), id(3)]);
  });
});

describe("flush", () => {
  it("envia a fila e remove os itens confirmados", async () => {
    mockPost.mockResolvedValue({ applied: [], rejected: [] });
    useSyncStore.setState({ queue: [item(1), item(2, "h2")] });
    expect(await useSyncStore.getState().flush()).toBe(true);
    expect(mockPost).toHaveBeenCalledWith([item(1), item(2, "h2")]);
    expect(useSyncStore.getState().queue).toEqual([]);
    expect(useSyncStore.getState().lastSyncAt).toBeDefined();
  });

  it("mantém a fila quando a rede falha e marca failed até o próximo sucesso", async () => {
    mockPost.mockRejectedValue(new Error("offline"));
    useSyncStore.setState({ queue: [item(1)] });
    expect(await useSyncStore.getState().flush()).toBe(false);
    expect(useSyncStore.getState().queue).toHaveLength(1);
    expect(useSyncStore.getState().failed).toBe(true);
    mockPost.mockResolvedValue({ applied: [], rejected: [] });
    expect(await useSyncStore.getState().flush()).toBe(true);
    expect(useSyncStore.getState().failed).toBe(false);
  });

  it("não perde itens enfileirados durante o envio", async () => {
    mockPost.mockResolvedValue({ applied: [], rejected: [] });
    mockPost.mockImplementationOnce(async () => {
      useSyncStore.getState().enqueue(item(9, "h3"));
      return { applied: [], rejected: [] };
    });
    useSyncStore.setState({ queue: [item(1)] });
    await useSyncStore.getState().flush();
    expect(mockPost.mock.calls.map((c) => c[0].map((i) => i.clientId))).toEqual([[id(1)], [id(9)]]);
    expect(useSyncStore.getState().queue).toEqual([]);
  });

  it("divide em lotes de 200", async () => {
    mockPost.mockResolvedValue({ applied: [], rejected: [] });
    useSyncStore.setState({
      queue: Array.from({ length: 450 }, (_, i) => item(i + 1, `h${i}`)),
    });
    await useSyncStore.getState().flush();
    expect(mockPost.mock.calls.map((c) => c[0].length)).toEqual([200, 200, 50]);
  });

  it("um flush com a fila vazia não trava os seguintes (regressão: flushing ficava preso)", async () => {
    mockPost.mockResolvedValue({ applied: [], rejected: [] });
    // Hidratação ao abrir o app: fila vazia, o corpo termina de forma síncrona.
    expect(await useSyncStore.getState().flush()).toBe(true);
    useSyncStore.getState().enqueue(item(1));
    expect(await useSyncStore.getState().flush()).toBe(true);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(useSyncStore.getState().queue).toEqual([]);
  });

  it("fila vazia não chama a API", async () => {
    expect(await useSyncStore.getState().flush()).toBe(true);
    expect(mockPost).not.toHaveBeenCalled();
  });
});
