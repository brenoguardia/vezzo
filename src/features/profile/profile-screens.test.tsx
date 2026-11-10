import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ApiError } from "@/api/client";
import { deleteAccount } from "@/api/account";
import { updateProfile } from "@/api/profile";
import { fetchHabits, fetchStats } from "@/api/summary";
import { authClient } from "@/auth/client";
import { requestPasswordReset, signInWithEmail } from "@/features/auth/actions";
import { i18n } from "@/i18n";
import type { ProfileDto } from "@/shared/schemas";
import { useProfileStore } from "@/store/profile";
import { useThemeStore } from "@/store/theme";
import { useToastStore } from "@/store/toast";
import DeleteAccount from "@/app/(tabs)/delete-account";
import Profile from "@/app/(tabs)/profile";
import ThemeScreen from "@/app/(tabs)/theme";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useFocusEffect: (effect: () => void | (() => void)) => {
    const react = jest.requireActual<typeof import("react")>("react");
    react.useEffect(effect, []);
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/auth/client", () => ({
  authClient: {
    getCookie: jest.fn(),
    signOut: jest.fn(async () => ({})),
    listAccounts: jest.fn(),
    useSession: jest.fn(),
    $store: { notify: jest.fn() },
  },
}));
jest.mock("@/api/profile", () => ({ updateProfile: jest.fn() }));
jest.mock("@/api/account", () => ({ deleteAccount: jest.fn() }));
jest.mock("@/api/summary", () => ({ fetchHabits: jest.fn(), fetchStats: jest.fn() }));
jest.mock("@/features/auth/actions", () => ({ requestPasswordReset: jest.fn(), signInWithEmail: jest.fn() }));

const mockUpdate = updateProfile as jest.Mock<typeof updateProfile>;
const mockDelete = deleteAccount as jest.Mock<typeof deleteAccount>;
const mockHabits = fetchHabits as jest.Mock<typeof fetchHabits>;
const mockStats = fetchStats as jest.Mock<typeof fetchStats>;
const mockAccounts = authClient.listAccounts as unknown as jest.Mock<() => Promise<{ data: { providerId: string }[] }>>;
const mockSession = authClient.useSession as unknown as jest.Mock;
const mockReset = requestPasswordReset as jest.Mock<typeof requestPasswordReset>;
const mockSignIn = signInWithEmail as jest.Mock<typeof signInWithEmail>;

const profile: ProfileDto = {
  displayName: "Ana",
  accent: "#b9d94c",
  themeMode: "DARK",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  onboardingDone: true,
  createdAt: "2026-10-15T12:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = "pt-BR";
  useThemeStore.setState({ accent: "#b9d94c", mode: "dark" });
  useProfileStore.setState({ profile, status: "ready" });
  useToastStore.setState({ message: null });
  mockSession.mockReturnValue({ data: { user: { email: "ana@exemplo.com" } } });
  mockAccounts.mockResolvedValue({ data: [{ providerId: "credential" }] });
  mockHabits.mockResolvedValue(new Array(5).fill(null) as never);
  mockStats.mockResolvedValue({ currentStreak: 12, week: { current: { completion: 0.86 } } } as never);
  mockUpdate.mockImplementation(async (patch) => ({ ...profile, ...patch }) as ProfileDto);
});

describe("tela de tema", () => {
  it("mostra a cor e o modo ao vivo sem salvar até tocar em Aplicar", async () => {
    await render(<ThemeScreen />);
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeDisabled();
    await fireEvent.press(screen.getByRole("radio", { name: "Azul" }));
    await fireEvent.press(screen.getByRole("radio", { name: "Claro" }));
    expect(useThemeStore.getState()).toMatchObject({ accent: "#4f9cf0", mode: "light" });
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeEnabled();
  });

  it("Aplicar grava em PUT /v1/profile e volta", async () => {
    await render(<ThemeScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Roxo" }));
    await fireEvent.press(screen.getByRole("radio", { name: "Claro" }));
    await fireEvent.press(screen.getByRole("button", { name: "Aplicar" }));
    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(mockUpdate).toHaveBeenCalledWith({ accent: "#9a7df0", themeMode: "LIGHT" });
    expect(useProfileStore.getState().profile).toMatchObject({ accent: "#9a7df0", themeMode: "LIGHT" });
    expect(useThemeStore.getState()).toMatchObject({ accent: "#9a7df0", mode: "light" });
  });

  it("sair sem aplicar restaura a cor e o modo salvos", async () => {
    const view = await render(<ThemeScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Rosa" }));
    expect(useThemeStore.getState().accent).toBe("#ee6f8f");
    await act(async () => view.unmount());
    expect(useThemeStore.getState()).toMatchObject({ accent: "#b9d94c", mode: "dark" });
  });

  it("falha ao salvar mostra aviso, fica na tela e mantém a prévia", async () => {
    mockUpdate.mockRejectedValue(new ApiError(500, "x"));
    await render(<ThemeScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Azul" }));
    await fireEvent.press(screen.getByRole("button", { name: "Aplicar" }));
    await waitFor(() => expect(useToastStore.getState().message).toContain("Não foi possível salvar o tema"));
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(useThemeStore.getState().accent).toBe("#4f9cf0");
  });
});

describe("tela de perfil", () => {
  it("mostra nome, desde quando, métricas e seções", async () => {
    await render(<Profile />);
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText("Usando desde outubro de 2026")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("86%")).toBeTruthy());
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Preferências")).toBeTruthy();
    expect(screen.getByText("Conta e segurança")).toBeTruthy();
    expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tema, Verde-limão" })).toBeTruthy();
  });

  it("Tema abre a tela de tema", async () => {
    await render(<Profile />);
    await fireEvent.press(screen.getByRole("button", { name: /^Tema/ }));
    expect(mockRouter.push).toHaveBeenCalledWith("/theme");
  });

  it("troca o idioma, traduz na hora e grava no perfil", async () => {
    await render(<Profile />);
    await fireEvent.press(screen.getByRole("button", { name: /^Idioma/ }));
    await fireEvent.press(screen.getByRole("button", { name: "English" }));
    await waitFor(() => expect(screen.getByText("Preferences")).toBeTruthy());
    expect(mockUpdate).toHaveBeenCalledWith({ language: "en" });
    expect(screen.getByText("Using since October 2026")).toBeTruthy();
  });

  it("volta o idioma se o servidor recusar", async () => {
    mockUpdate.mockRejectedValue(new ApiError(500, "x"));
    await render(<Profile />);
    await fireEvent.press(screen.getByRole("button", { name: /^Idioma/ }));
    await fireEvent.press(screen.getByRole("button", { name: "English" }));
    await waitFor(() => expect(useToastStore.getState().message).toContain("idioma"));
    expect(i18n.locale).toBe("pt-BR");
  });

  it("Redefinir senha envia o link ao e-mail da conta e abre a tela de verificação", async () => {
    mockReset.mockResolvedValue({ ok: true });
    await render(<Profile />);
    await fireEvent.press(await screen.findByRole("button", { name: "Redefinir senha" }));
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/check-email",
        params: { email: "ana@exemplo.com", purpose: "reset" },
      }),
    );
    expect(mockReset).toHaveBeenCalledWith({ email: "ana@exemplo.com" });
  });

  it("conta só com Apple/Google não mostra Redefinir senha", async () => {
    mockAccounts.mockResolvedValue({ data: [{ providerId: "google" }] });
    await render(<Profile />);
    await waitFor(() => expect(mockAccounts).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Redefinir senha" })).toBeNull();
  });

  it("Sair encerra a sessão e limpa o perfil", async () => {
    await render(<Profile />);
    await fireEvent.press(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(useProfileStore.getState().profile).toBeNull());
    expect(authClient.signOut).toHaveBeenCalled();
  });

  it("Excluir conta fica em área separada e abre a confirmação", async () => {
    await render(<Profile />);
    await fireEvent.press(screen.getByRole("button", { name: "Excluir conta" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/delete-account");
  });
});

describe("tela de excluir conta", () => {
  async function typePassword(value = "segredo123") {
    await fireEvent.changeText(await screen.findByLabelText("Senha"), value);
  }

  it("pede a senha, reautentica, exclui e sai", async () => {
    mockSignIn.mockResolvedValue({ ok: true });
    mockDelete.mockResolvedValue();
    await render(<DeleteAccount />);
    const confirm = () => screen.getByRole("button", { name: "Excluir definitivamente" });
    await waitFor(() => expect(confirm()).toBeDisabled());
    await typePassword();
    await waitFor(() => expect(confirm()).toBeEnabled());
    await fireEvent.press(confirm());
    await waitFor(() => expect(useProfileStore.getState().profile).toBeNull());
    expect(mockSignIn).toHaveBeenCalledWith({ email: "ana@exemplo.com", password: "segredo123" });
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("senha errada não exclui nada", async () => {
    mockSignIn.mockResolvedValue({ ok: false, key: "invalidCredentials" });
    await render(<DeleteAccount />);
    await typePassword("errada123");
    await fireEvent.press(await screen.findByRole("button", { name: "Excluir definitivamente" }));
    await waitFor(() => expect(screen.getByText("E-mail ou senha incorretos.")).toBeTruthy());
    expect(mockDelete).not.toHaveBeenCalled();
    expect(useProfileStore.getState().profile).not.toBeNull();
  });

  it("falha na exclusão mostra erro e mantém a sessão", async () => {
    mockSignIn.mockResolvedValue({ ok: true });
    mockDelete.mockRejectedValue(new ApiError(500, "x"));
    await render(<DeleteAccount />);
    await typePassword();
    await fireEvent.press(await screen.findByRole("button", { name: "Excluir definitivamente" }));
    await waitFor(() => expect(screen.getByText("Não foi possível excluir a conta. Tente de novo.")).toBeTruthy());
    expect(useProfileStore.getState().profile).not.toBeNull();
  });

  it("conta social sem login recente é orientada a sair e entrar de novo", async () => {
    mockAccounts.mockResolvedValue({ data: [{ providerId: "apple" }] });
    mockDelete.mockRejectedValue(new ApiError(403, "x"));
    await render(<DeleteAccount />);
    expect(screen.queryByLabelText("Senha")).toBeNull();
    await fireEvent.press(await screen.findByRole("button", { name: "Excluir definitivamente" }));
    await waitFor(() => expect(screen.getByText(/saia e entre de novo/)).toBeTruthy());
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("Cancelar volta sem excluir", async () => {
    await render(<DeleteAccount />);
    await fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    expect(mockRouter.back).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
