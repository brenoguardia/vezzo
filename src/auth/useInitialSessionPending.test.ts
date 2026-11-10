import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react-native";
import { useInitialSessionPending } from "./useInitialSessionPending";

describe("useInitialSessionPending", () => {
  it("fica pendente até a primeira resolução", async () => {
    const { result, rerender } = await renderHook((p: { pending: boolean }) => useInitialSessionPending(p.pending), {
      initialProps: { pending: true },
    });
    expect(result.current).toBe(true);
    await rerender({ pending: false });
    expect(result.current).toBe(false);
  });

  it("uma nova busca (isPending volta a true) não derruba o app para 'carregando'", async () => {
    const { result, rerender } = await renderHook((p: { pending: boolean }) => useInitialSessionPending(p.pending), {
      initialProps: { pending: true },
    });
    await rerender({ pending: false });
    await rerender({ pending: true });
    expect(result.current).toBe(false);
  });
});
