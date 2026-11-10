import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { createHabit, deleteHabit, unarchiveHabit } from "@/api/habits";
import Habits from "@/app/(tabs)/habits";
import Today from "@/app/(tabs)/home";
import Progress from "@/app/(tabs)/progress";
import EditHabit from "@/app/habit/[id]/edit";
import NewHabit from "@/app/habit/new";
import { hydrateHabits } from "@/features/habits/hydrate";
import { setLocale } from "@/i18n";
import type { HabitDto, ProfileDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useProfileStore } from "@/store/profile";
import { useSyncStore } from "@/store/sync";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  dismissTo: jest.fn(),
};
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));
// Estas telas são testadas no layout de uma coluna; o modo dual tem o próprio arquivo de testes.
jest.mock("@/lib/useLayoutMode", () => ({
  useLayoutMode: () => (jest.requireActual("@/lib/layout-mode") as typeof import("@/lib/layout-mode")).layoutInfo(390),
}));
jest.mock("@/features/habits/hydrate", () => ({ hydrateHabits: jest.fn() }));
jest.mock("expo-crypto", () => ({ randomUUID: () => "00000000-0000-4000-8000-000000000001" }));
jest.mock("@/api/logs", () => ({ postLogBatch: jest.fn(() => new Promise(() => {})), fetchLogs: jest.fn() }));
jest.mock("@/api/habits", () => ({
  createHabit: jest.fn(),
  patchHabit: jest.fn(),
  deleteHabit: jest.fn(),
  unarchiveHabit: jest.fn(),
}));
jest.mock("@/api/summary", () => ({ fetchHabits: jest.fn(), fetchStats: jest.fn() }));
jest.mock("@/auth/client", () => ({ authClient: {} }));
jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));

const mockCreate = createHabit as jest.Mock<typeof createHabit>;
const mockDelete = deleteHabit as jest.Mock<typeof deleteHabit>;
const mockUnarchive = unarchiveHabit as jest.Mock<typeof unarchiveHabit>;

const profile: ProfileDto = {
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
  setLocale("pt-BR");
  useProfileStore.setState({ profile, status: "ready" });
  useHabitsStore.getState().clear();
  useSyncStore.setState({ queue: [], failed: false });
  useHydrationStore.setState({ status: "ready" });
});

describe("Hoje · carregamento e erro", () => {
  it("primeira carga sem cache mostra skeleton, não o estado vazio", async () => {
    useHydrationStore.setState({ status: "loading" });
    await render(<Today />);
    expect(screen.getByLabelText("Carregando seus hábitos")).toBeTruthy();
    expect(screen.queryByText("Nenhum hábito ainda")).toBeNull();
  });

  it("falha de rede mostra a faixa e tenta de novo", async () => {
    useHabitsStore.getState().hydrate([habit("a".repeat(24))], []);
    useHydrationStore.setState({ status: "error" });
    await render(<Today />);
    expect(screen.getByText(/Não foi possível atualizar. Mostrando/)).toBeTruthy();
    expect(screen.getByText("Meditar")).toBeTruthy();
    await fireEvent.press(screen.getByText("Tentar de novo"));
    expect(hydrateHabits).toHaveBeenCalledWith("UTC");
  });
});

describe("Hoje", () => {
  it("sem hábitos mostra o estado vazio e leva à criação", async () => {
    await render(<Today />);
    expect(screen.getByText("Nenhum hábito ainda")).toBeTruthy();
    await fireEvent.press(screen.getByText("Criar hábito"));
    expect(mockRouter.push).toHaveBeenCalledWith("/habit/new");
  });

  it("lista hábitos e marca como feito pelo círculo", async () => {
    useHabitsStore.getState().hydrate([habit("a".repeat(24))], []);
    await render(<Today />);
    expect(screen.getByText("Olá, Ana")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Marcar Meditar como feito"));
    expect(useSyncStore.getState().queue).toHaveLength(1);
    expect(screen.getByLabelText("Desmarcar Meditar")).toBeTruthy();
  });

  it("abre o detalhe ao tocar na linha", async () => {
    useHabitsStore.getState().hydrate([habit("b".repeat(24))], []);
    await render(<Today />);
    await fireEvent.press(screen.getByText("Meditar"));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/habit/[id]", params: { id: "b".repeat(24) } });
  });

  it("alterações em envio mostram 'Sincronizando', sem dizer que está offline", async () => {
    useHabitsStore.getState().hydrate([habit("c".repeat(24))], []);
    useHabitsStore.getState().toggleDone("c".repeat(24), "2026-11-10");
    await render(<Today />);
    expect(screen.getByText("Sincronizando suas alterações…")).toBeTruthy();
    expect(screen.queryByText(/Sem conexão/)).toBeNull();
  });

  it("só afirma 'Sem conexão' depois de um envio que falhou", async () => {
    useHabitsStore.getState().hydrate([habit("c".repeat(24))], []);
    useHabitsStore.getState().toggleDone("c".repeat(24), "2026-11-10");
    useSyncStore.setState({ failed: true });
    await render(<Today />);
    expect(screen.getByText(/Sem conexão/)).toBeTruthy();
  });
});

describe("Hábitos e Progresso · carregamento e erro", () => {
  it("Hábitos mostra skeleton na primeira carga sem cache", async () => {
    useHydrationStore.setState({ status: "loading" });
    await render(<Habits />);
    expect(screen.getByLabelText("Carregando seus hábitos")).toBeTruthy();
    expect(screen.queryByText("Crie seu primeiro hábito para começar.")).toBeNull();
  });

  it("Hábitos e Progresso mostram a faixa de erro e tentam de novo", async () => {
    useHabitsStore.getState().hydrate([habit("a".repeat(24))], []);
    useHydrationStore.setState({ status: "error" });
    await render(<Habits />);
    expect(screen.getByText(/Não foi possível atualizar/)).toBeTruthy();
    await fireEvent.press(screen.getByText("Tentar de novo"));
    expect(hydrateHabits).toHaveBeenCalledWith("UTC");
  });

  it("Progresso mostra skeleton na primeira carga sem cache", async () => {
    useHydrationStore.setState({ status: "loading" });
    await render(<Progress />);
    expect(screen.getByLabelText("Carregando seus hábitos")).toBeTruthy();
    expect(screen.queryByText(/Sem hábitos/)).toBeNull();
  });

  it("Progresso: erro em mês/ano oferece tentar de novo", async () => {
    const { fetchStats } = jest.requireMock("@/api/summary") as { fetchStats: jest.Mock<() => Promise<unknown>> };
    useHabitsStore.getState().hydrate([habit("a".repeat(24))], []);
    fetchStats.mockRejectedValueOnce(new Error("offline"));
    fetchStats.mockResolvedValue({ days: [], currentStreak: 0 });
    await render(<Progress />);
    await fireEvent.press(screen.getByText("Mês"));
    await waitFor(() => expect(screen.getByText("Não foi possível carregar sua conta.")).toBeTruthy());
    await fireEvent.press(screen.getByText("Tentar de novo"));
    await waitFor(() => expect(screen.queryByText("Não foi possível carregar sua conta.")).toBeNull());
    expect(fetchStats).toHaveBeenCalledTimes(2);
  });
});

describe("Hábitos", () => {
  it("separa ativos e arquivados", async () => {
    useHabitsStore
      .getState()
      .hydrate(
        [habit("a".repeat(24)), habit("b".repeat(24), { name: "Ler", archivedAt: "2026-11-01T00:00:00.000Z" })],
        [],
      );
    await render(<Habits />);
    expect(screen.getByText("Meditar")).toBeTruthy();
    expect(screen.getByText("Arquivado")).toBeTruthy();
  });
});

describe("Editar hábito", () => {
  it("arquivar volta para a lista de hábitos, não para o detalhe do arquivado", async () => {
    const id = "e".repeat(24);
    mockParams = { id };
    mockDelete.mockResolvedValue(undefined);
    useHabitsStore.getState().hydrate([habit(id)], []);
    await render(<EditHabit />);
    await fireEvent.press(screen.getByRole("button", { name: "Arquivar hábito" }));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(id));
    await waitFor(() => expect(mockRouter.dismissTo).toHaveBeenCalledWith("/habits"));
    expect(useHabitsStore.getState().habits[0]?.archivedAt).toBeTruthy();
    mockParams = {};
  });
});

describe("Hábitos · arquivados", () => {
  it("Desarquivar devolve o hábito para os ativos", async () => {
    const id = "f".repeat(24);
    const archived = habit(id, { name: "Ler", archivedAt: "2026-11-01T00:00:00.000Z" });
    useHabitsStore.getState().hydrate([archived], []);
    mockUnarchive.mockResolvedValue({ ...archived, archivedAt: null });
    await render(<Habits />);
    await fireEvent.press(screen.getByRole("button", { name: "Desarquivar: Ler" }));
    await waitFor(() => expect(mockUnarchive).toHaveBeenCalledWith(id));
    await waitFor(() => expect(useHabitsStore.getState().habits[0]?.archivedAt).toBeNull());
  });
});

describe("Novo hábito", () => {
  it("só habilita Salvar com nome válido e cria no servidor", async () => {
    const created = habit("d".repeat(24), { name: "Ler" });
    mockCreate.mockResolvedValue(created);
    await render(<NewHabit />);
    expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(true);
    await fireEvent.changeText(screen.getByPlaceholderText("Ex.: Ler antes de dormir"), "Ler");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(false),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate.mock.calls[0]?.[0]).toMatchObject({ name: "Ler", emoji: "🎯", goalUnit: "BOOLEAN" });
    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(useHabitsStore.getState().habits[0]?.name).toBe("Ler");
  });

  it("mostra erro quando o servidor falha", async () => {
    mockCreate.mockRejectedValue(new Error("offline"));
    await render(<NewHabit />);
    await fireEvent.changeText(screen.getByPlaceholderText("Ex.: Ler antes de dormir"), "Ler");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(false),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.getByText(/Não foi possível salvar/)).toBeTruthy());
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it("uma atividade pré-definida preenche nome e meta", async () => {
    await render(<NewHabit />);
    await fireEvent.press(screen.getByText(/Beber água/));
    await waitFor(() => expect(screen.getByDisplayValue("Beber água")).toBeTruthy());
  });
});
