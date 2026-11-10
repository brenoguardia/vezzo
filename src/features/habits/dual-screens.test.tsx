import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Activities from "@/app/(onboarding)/activities";
import Habits from "@/app/(tabs)/habits";
import Today from "@/app/(tabs)/home";
import Progress from "@/app/(tabs)/progress";
import { SplitView } from "@/components/layout";
import { Text } from "@/components/ui";
import { setLocale } from "@/i18n";
import type { HabitDto, ProfileDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useOnboardingStore } from "@/store/onboarding";
import { useProfileStore } from "@/store/profile";
import { useSyncStore } from "@/store/sync";

let mockWidth = 1100;
jest.mock("@/lib/useLayoutMode", () => ({
  useLayoutMode: () =>
    (jest.requireActual("@/lib/layout-mode") as typeof import("@/lib/layout-mode")).layoutInfo(mockWidth),
}));
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  dismissAll: jest.fn(),
};
jest.mock("expo-router", () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => ({}) }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "00000000-0000-4000-8000-000000000001" }));
jest.mock("@/api/logs", () => ({ postLogBatch: jest.fn(() => new Promise(() => {})), fetchLogs: jest.fn() }));
jest.mock("@/api/habits", () => ({ createHabit: jest.fn(), patchHabit: jest.fn(), deleteHabit: jest.fn() }));
jest.mock("@/api/onboarding", () => ({ completeOnboarding: jest.fn() }));
jest.mock("@/api/summary", () => ({ fetchHabits: jest.fn(), fetchStats: jest.fn(() => new Promise(() => {})) }));
jest.mock("@/auth/client", () => ({ authClient: {} }));
jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));

const A = "a".repeat(24);
const B = "b".repeat(24);
const profile = {
  displayName: "Ana",
  accent: "#b9d94c",
  themeMode: "DARK",
  language: "pt-BR",
  timezone: "UTC",
  onboardingDone: true,
  createdAt: "2026-10-01T00:00:00.000Z",
} as ProfileDto;
const habit = (id: string, over: Partial<HabitDto> = {}): HabitDto => ({
  id,
  templateId: null,
  name: "Meditar",
  emoji: "🧘",
  goalValue: 1,
  goalUnit: "BOOLEAN",
  days: [0, 1, 2, 3, 4, 5, 6],
  reminders: [],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-10-01T00:00:00.000Z",
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockWidth = 1100;
  setLocale("pt-BR");
  useProfileStore.setState({ profile, status: "ready" });
  useHabitsStore.getState().clear();
  useSyncStore.setState({ queue: [] });
  useOnboardingStore.getState().reset();
  useHabitsStore.getState().hydrate([habit(A), habit(B, { name: "Ler", order: 1 })], []);
});

describe("SplitView", () => {
  const sides = <SplitView left={<Text>esquerda</Text>} right={<Text>direita</Text>} />;

  it("dual renderiza as duas colunas", async () => {
    await render(sides);
    expect(screen.getByTestId("split-left")).toBeTruthy();
    expect(screen.getByTestId("split-right")).toBeTruthy();
    expect(screen.getByText("direita")).toBeTruthy();
  });

  it("single renderiza só o lado ativo", async () => {
    mockWidth = 390;
    await render(<SplitView left={<Text>esquerda</Text>} right={<Text>direita</Text>} active="right" />);
    expect(screen.queryByText("esquerda")).toBeNull();
    expect(screen.getByText("direita")).toBeTruthy();
  });
});

describe("Hoje · dual", () => {
  it("sem seleção mostra o gráfico semanal à direita", async () => {
    await render(<Today />);
    expect(screen.getByText("Toque em um hábito para ver o detalhe.")).toBeTruthy();
  });

  it("tocar na linha seleciona o hábito sem navegar e mostra o detalhe", async () => {
    await render(<Today />);
    await fireEvent.press(screen.getByText("Ler"));
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(useHabitsStore.getState().selectedHabitId).toBe(B);
    await waitFor(() => expect(screen.getByText("Últimas 4 semanas")).toBeTruthy());
  });

  it("single navega para o detalhe", async () => {
    mockWidth = 390;
    await render(<Today />);
    await fireEvent.press(screen.getByText("Ler"));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/habit/[id]", params: { id: B } });
    expect(screen.queryByText("Toque em um hábito para ver o detalhe.")).toBeNull();
  });
});

describe("Progresso · dual", () => {
  it("separa gráfico e melhor dia (esquerda) de sequência e por hábito (direita)", async () => {
    await render(<Progress />);
    expect(screen.getByTestId("split-left")).toBeTruthy();
    expect(screen.getByText("Por hábito")).toBeTruthy();
    expect(screen.getByText("Melhor dia")).toBeTruthy();
  });
});

describe("Hábitos · dual", () => {
  it("selecionar abre a edição à direita", async () => {
    await render(<Habits />);
    expect(screen.getByText("Selecione um hábito para editar.")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(/^Ler\./));
    expect(mockRouter.push).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByDisplayValue("Ler")).toBeTruthy());
  });
});

describe("Onboarding · dual", () => {
  it("atividades à esquerda e metas com Começar à direita", async () => {
    await render(<Activities />);
    expect(screen.getByRole("button", { name: "Começar" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Continuar/ })).toBeNull();
  });

  it("single mantém os passos separados", async () => {
    mockWidth = 390;
    await render(<Activities />);
    expect(screen.getByRole("button", { name: /^Continuar/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Começar" })).toBeNull();
  });
});
