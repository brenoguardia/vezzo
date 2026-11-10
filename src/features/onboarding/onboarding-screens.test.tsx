import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { completeOnboarding } from "@/api/onboarding";
import Activities from "@/app/(onboarding)/activities";
import Goals from "@/app/(onboarding)/goals";
import Name from "@/app/(onboarding)/name";
import Reminders from "@/app/(onboarding)/reminders";
import { i18n } from "@/i18n";
import { requestReminderPermission } from "@/lib/notifications/permission";
import { DEFAULT_SELECTION } from "@/shared/onboarding";
import { useOnboardingStore } from "@/store/onboarding";
import { useProfileStore } from "@/store/profile";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// Estas telas são testadas no layout de uma coluna; o modo dual tem o próprio arquivo de testes.
jest.mock("@/lib/useLayoutMode", () => ({
  useLayoutMode: () => (jest.requireActual("@/lib/layout-mode") as typeof import("@/lib/layout-mode")).layoutInfo(390),
}));
jest.mock("@/auth/client", () => ({ authClient: { getCookie: jest.fn(), signOut: jest.fn() } }));
jest.mock("@/api/onboarding", () => ({ completeOnboarding: jest.fn() }));
jest.mock("@/lib/notifications/permission", () => ({ requestReminderPermission: jest.fn() }));

const mockComplete = completeOnboarding as jest.Mock<typeof completeOnboarding>;
const mockPermission = requestReminderPermission as jest.Mock<typeof requestReminderPermission>;

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = "pt-BR";
  useOnboardingStore.getState().reset();
  useProfileStore.setState({
    profile: {
      displayName: "ana",
      accent: "#b9d94c",
      themeMode: "SYSTEM",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      onboardingDone: false,
      createdAt: "2026-11-01T00:00:00.000Z",
    },
    status: "ready",
  });
});

describe("etapa 1 · nome", () => {
  it("só habilita Continuar com nome válido e guarda no store", async () => {
    await render(<Name />);
    const button = () => screen.getByRole("button", { name: "Continuar" });
    expect(button()).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText("Seu nome"), "  Ana ");
    await waitFor(() => expect(button()).toBeEnabled());
    await fireEvent.press(button());
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/activities"));
    expect(useOnboardingStore.getState().displayName).toBe("Ana");
  });

  it("recusa mais de 30 caracteres", async () => {
    await render(<Name />);
    await fireEvent.changeText(screen.getByLabelText("Seu nome"), "a".repeat(31));
    await waitFor(() => expect(screen.getByText("Use até 30 caracteres.")).toBeTruthy());
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("retoma o nome persistido", async () => {
    useOnboardingStore.getState().setName("Bia");
    await render(<Name />);
    expect(screen.getByLabelText("Seu nome").props.value).toBe("Bia");
  });
});

describe("etapa 2 · atividades", () => {
  it("mostra os quatro pré-selecionados e conta os escolhidos", async () => {
    await render(<Activities />);
    expect(screen.getByRole("button", { name: /Continuar · 4/ })).toBeEnabled();
    expect(screen.getByText("Saúde")).toBeTruthy();
    await fireEvent.press(screen.getByText(/Diário/));
    expect(screen.getByRole("button", { name: /Continuar · 5/ })).toBeTruthy();
    await fireEvent.press(screen.getByText(/Diário/));
    expect(screen.getByRole("button", { name: /Continuar · 4/ })).toBeTruthy();
  });

  it("exige ao menos um hábito", async () => {
    useOnboardingStore.setState({ selected: {} });
    await render(<Activities />);
    expect(screen.getByRole("button", { name: /Continuar · 0/ })).toBeDisabled();
  });

  it("avança para as metas", async () => {
    await render(<Activities />);
    await fireEvent.press(screen.getByRole("button", { name: /Continuar · 4/ }));
    expect(mockRouter.push).toHaveBeenCalledWith("/goals");
  });
});

describe("etapa 3 · metas", () => {
  beforeEach(() => useOnboardingStore.getState().setName("Ana"));

  it("mostra um cartão por hábito com a meta formatada", async () => {
    await render(<Goals />);
    expect(screen.getByText("Beber água")).toBeTruthy();
    expect(screen.getByText("2,5 L")).toBeTruthy();
    expect(screen.getByText("30 min")).toBeTruthy();
    expect(screen.getByText("15 pág.")).toBeTruthy();
  });

  it("stepper usa o passo da unidade e grava no store", async () => {
    await render(<Goals />);
    await fireEvent.press(screen.getByLabelText("Aumentar meta de Beber água"));
    expect(screen.getByText("2,75 L")).toBeTruthy();
    expect(useOnboardingStore.getState().selected["beber-agua"]?.goalValue).toBe(2.75);
    await fireEvent.press(screen.getByLabelText("Diminuir meta de Ler"));
    expect(screen.getByText("10 pág.")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Aumentar meta de Meditar"));
    expect(screen.getByText("15 min")).toBeTruthy();
  });

  it("pílulas de dia alteram os dias do hábito", async () => {
    await render(<Goals />);
    const monday = screen.getAllByLabelText("Segunda")[0];
    if (!monday) throw new Error("sem pílula");
    await fireEvent.press(monday);
    expect(useOnboardingStore.getState().selected["beber-agua"]?.days).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("Começar envia nome + hábitos e segue para os lembretes", async () => {
    mockComplete.mockResolvedValue({ profile: useProfileStore.getState().profile!, habits: [] });
    await render(<Goals />);
    await fireEvent.press(screen.getByRole("button", { name: "Começar" }));
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/reminders"));
    const sent = mockComplete.mock.calls[0]?.[0];
    expect(sent?.displayName).toBe("Ana");
    expect(sent?.habits.map((h) => h.templateSlug)).toEqual(["beber-agua", "treinar", "meditar", "ler"]);
    expect(sent?.habits[0]).toMatchObject({ goalValue: 2.5, goalUnit: "LITERS" });
  });

  it("falha de rede mostra erro e não avança", async () => {
    mockComplete.mockRejectedValue(new Error("offline"));
    await render(<Goals />);
    await fireEvent.press(screen.getByRole("button", { name: "Começar" }));
    await waitFor(() =>
      expect(screen.getByText("Não foi possível salvar. Verifique a conexão e tente de novo.")).toBeTruthy(),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(useOnboardingStore.getState().selected).not.toEqual({});
  });
});

describe("lembretes · permissão de notificação", () => {
  it("Ativar pede a permissão do sistema e conclui o onboarding", async () => {
    mockPermission.mockResolvedValue("granted");
    useOnboardingStore.getState().setName("Ana");
    await render(<Reminders />);
    expect(screen.getByText("Quer receber lembretes dos seus hábitos?")).toBeTruthy();
    expect(mockPermission).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole("button", { name: "Ativar lembretes" }));
    await waitFor(() => expect(useProfileStore.getState().profile?.onboardingDone).toBe(true));
    expect(mockPermission).toHaveBeenCalledTimes(1);
    expect(useOnboardingStore.getState().displayName).toBe("");
    expect(useOnboardingStore.getState().selected).toEqual(DEFAULT_SELECTION);
  });

  it("Agora não conclui sem pedir permissão", async () => {
    await render(<Reminders />);
    await fireEvent.press(screen.getByRole("button", { name: "Agora não" }));
    await waitFor(() => expect(useProfileStore.getState().profile?.onboardingDone).toBe(true));
    expect(mockPermission).not.toHaveBeenCalled();
  });

  it("permissão negada também conclui", async () => {
    mockPermission.mockResolvedValue("denied");
    await render(<Reminders />);
    await fireEvent.press(screen.getByRole("button", { name: "Ativar lembretes" }));
    await waitFor(() => expect(useProfileStore.getState().profile?.onboardingDone).toBe(true));
  });
});
