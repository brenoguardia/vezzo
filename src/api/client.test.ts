import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { z } from "zod";
import { ApiError, apiFetch, REQUEST_TIMEOUT_MS } from "./client";

const mockGetCookie = jest.fn<() => Promise<string>>();
jest.mock("@/auth/client", () => ({ authClient: { getCookie: () => mockGetCookie() } }));

const schema = z.object({ ok: z.boolean() });
const mockFetch = jest.fn<typeof fetch>();

const ok = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCookie.mockResolvedValue("better-auth.session_token=abc");
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  jest.useRealTimers();
});

describe("apiFetch", () => {
  it("envia o cookie da sessão, sem credentials do navegador, e valida a resposta", async () => {
    mockFetch.mockReturnValue(ok({ ok: true }));
    await expect(apiFetch("/v1/profile", schema)).resolves.toEqual({ ok: true });
    const [url, init] = mockFetch.mock.calls[0] ?? [];
    expect(String(url)).toMatch(/\/api\/v1\/profile$/);
    expect(init?.credentials).toBe("omit");
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
      Cookie: "better-auth.session_token=abc",
    });
  });

  it("sem cookie não manda o cabeçalho Cookie", async () => {
    mockGetCookie.mockResolvedValue("");
    mockFetch.mockReturnValue(ok({ ok: true }));
    await apiFetch("/v1/profile", schema);
    expect(mockFetch.mock.calls[0]?.[1]?.headers).not.toHaveProperty("Cookie");
  });

  it("cabeçalhos do chamador somam aos padrões", async () => {
    mockFetch.mockReturnValue(ok({ ok: true }));
    await apiFetch("/v1/profile", schema, { method: "PUT", headers: { "X-Test": "1" } });
    expect(mockFetch.mock.calls[0]?.[1]).toMatchObject({ method: "PUT", headers: { "X-Test": "1" } });
  });

  it("status de erro vira ApiError com o código HTTP", async () => {
    mockFetch.mockReturnValue(ok({ error: { code: "UNAUTHORIZED" } }, 401));
    const error = await apiFetch("/v1/profile", schema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
  });

  it("resposta fora do schema é rejeitada", async () => {
    mockFetch.mockReturnValue(ok({ ok: "sim" }));
    await expect(apiFetch("/v1/profile", schema)).rejects.toThrow();
  });

  it("aborta a requisição pendurada depois do limite de tempo", async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const pending = apiFetch("/v1/profile", schema);
    const assertion = expect(pending).rejects.toThrow("aborted");
    await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await assertion;
  });
});
