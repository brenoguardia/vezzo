import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import Index from "@/app/index";
import { authClient } from "@/auth/client";
import type { ProfileDto } from "@/shared/schemas";
import { useProfileStore } from "@/store/profile";

jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text: Label } = jest.requireActual<typeof import("react-native")>("react-native");
    return <Label>{`redirect:${href}`}</Label>;
  },
}));
jest.mock("@/auth/client", () => ({ authClient: { useSession: jest.fn() } }));

const useSession = authClient.useSession as unknown as jest.Mock;
const session = (userId: string | null, isPending = false) =>
  useSession.mockReturnValue({ data: userId ? { user: { id: userId } } : null, isPending });

const profile = (onboardingDone: boolean): ProfileDto => ({
  displayName: "Ana",
  accent: "#b9d94c",
  themeMode: "DARK",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  onboardingDone,
  createdAt: "2026-11-01T00:00:00.000Z",
});

const redirect = () => screen.queryByText(/^redirect:/);

beforeEach(() => {
  jest.clearAllMocks();
  useProfileStore.setState({ profile: null, ownerId: null, status: "idle" });
});

describe("rota / (entrada)", () => {
  it("sem sessão vai para o login", async () => {
    session(null);
    await render(<Index />);
    expect(screen.getByText("redirect:/welcome")).toBeTruthy();
  });

  it("enquanto a sessão carrega não redireciona", async () => {
    session(null, true);
    await render(<Index />);
    expect(redirect()).toBeNull();
  });

  it("com perfil em cache do mesmo usuário e SEM rede (status idle) vai direto para as abas", async () => {
    // Regressão: a rota "/" lia o status bruto e ficava esperando para sempre (tela vazia) sem rede.
    session("u1");
    useProfileStore.setState({ profile: profile(true), ownerId: "u1", status: "idle" });
    await render(<Index />);
    expect(screen.getByText("redirect:/home")).toBeTruthy();
  });

  it("perfil em cache com onboarding pendente vai para o onboarding", async () => {
    session("u1");
    useProfileStore.setState({ profile: profile(false), ownerId: "u1", status: "idle" });
    await render(<Index />);
    expect(screen.getByText("redirect:/name")).toBeTruthy();
  });

  it("cache de outro usuário nunca vale: espera o perfil do usuário atual", async () => {
    session("u2");
    useProfileStore.setState({ profile: profile(true), ownerId: "u1", status: "idle" });
    await render(<Index />);
    expect(redirect()).toBeNull();
  });

  it("sem cache, espera a requisição e depois encaminha", async () => {
    session("u1");
    useProfileStore.setState({ profile: null, ownerId: "u1", status: "loading" });
    const view = await render(<Index />);
    expect(redirect()).toBeNull();
    await act(async () => {
      useProfileStore.setState({ profile: profile(true), ownerId: "u1", status: "ready" });
    });
    await view.rerender(<Index />);
    expect(screen.getByText("redirect:/home")).toBeTruthy();
  });
});
