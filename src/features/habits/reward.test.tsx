import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { HabitForm } from "@/features/habits/HabitForm";
import { RewardCard } from "@/features/habits/RewardCard";
import { setLocale } from "@/i18n";
import type { HabitDto, RewardDto, RewardProgressDto } from "@/shared/schemas";
import { useToastStore } from "@/store/toast";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));

const reward: RewardDto = { title: "iPhone", emoji: "📱", days: 180, startDate: "2026-11-01", claimedAt: null };
const habit = { id: "0000000000000000000000aa", reward } as HabitDto;
const progress = (over: Partial<RewardProgressDto> = {}): RewardProgressDto => ({
  state: "ACTIVE",
  currentRun: 45,
  daysLeft: 135,
  percent: 0.25,
  best: 45,
  attempts: 1,
  runStart: "2026-11-01",
  achievedDate: null,
  ...over,
});

const card = (p: RewardProgressDto | undefined, extra: Partial<Parameters<typeof RewardCard>[0]> = {}) =>
  render(
    <RewardCard
      habit={habit}
      reward={reward}
      progress={p}
      error={false}
      claiming={false}
      onClaim={jest.fn()}
      {...extra}
    />,
  );

beforeEach(() => {
  setLocale("pt-BR");
  useToastStore.getState().hide();
});

describe("RewardCard", () => {
  it("mostra o presente, o progresso e os dias restantes", async () => {
    await card(progress());
    expect(screen.getByText("📱 iPhone")).toBeTruthy();
    expect(screen.getByText("45 de 180 dias")).toBeTruthy();
    expect(screen.getByText("Faltam 135 dias")).toBeTruthy();
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("mostra recomeço e melhor sequência após uma falha", async () => {
    await card(progress({ attempts: 2, runStart: "2026-11-05", currentRun: 3, best: 10 }));
    expect(screen.getByText(/Recomeçou em 05\/11 · tentativa 2/)).toBeTruthy();
    expect(screen.getByText("Melhor sequência: 10 dias")).toBeTruthy();
  });

  it("conquistado: oferece o resgate", async () => {
    const onClaim = jest.fn();
    await card(progress({ state: "ACHIEVED", percent: 1, daysLeft: 0, achievedDate: "2026-11-30" }), { onClaim });
    expect(screen.getByText("Meta cumprida! 🎉")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Já me presenteei" }));
    expect(onClaim).toHaveBeenCalledTimes(1);
  });

  it("resgatado: mostra a conquista e esconde o botão", async () => {
    await card(progress({ state: "CLAIMED", percent: 1, daysLeft: 0, achievedDate: "2026-11-30" }));
    expect(screen.getByText("Presente resgatado")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Já me presenteei" })).toBeNull();
  });

  it("avisa com toast quando passa de ativo para conquistado", async () => {
    const view = await card(progress());
    expect(useToastStore.getState().message).toBeNull();
    await view.rerender(
      <RewardCard
        habit={habit}
        reward={reward}
        progress={progress({ state: "ACHIEVED", percent: 1, daysLeft: 0 })}
        error={false}
        claiming={false}
        onClaim={jest.fn()}
      />,
    );
    expect(useToastStore.getState().message).toBe("Meta cumprida! Hora do seu presente.");
  });
});

describe("bloco Meta e presente do formulário", () => {
  const form = (onSubmit = jest.fn(async (_values: unknown) => {})) =>
    render(<HabitForm title="Novo hábito" onCancel={jest.fn()} onSubmit={onSubmit} />);

  it("é opcional: sem ativar, o formulário envia reward nulo", async () => {
    const onSubmit = jest.fn(async (_values: unknown) => {});
    await form(onSubmit);
    await fireEvent.changeText(screen.getByLabelText("Nome"), "Meditar");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(false),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ reward: null });
  });

  it("ativado, exige o título do presente e envia a meta", async () => {
    const onSubmit = jest.fn(async (_values: unknown) => {});
    await form(onSubmit);
    await fireEvent.changeText(screen.getByLabelText("Nome"), "Meditar");
    await fireEvent.press(screen.getByLabelText("Definir um presente"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(true),
    );
    await fireEvent.press(screen.getByRole("button", { name: "180 dias" }));
    await fireEvent.changeText(screen.getByLabelText("Presente"), "iPhone");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(false),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ reward: { title: "iPhone", days: 180, emoji: "🎁" } });
  });
});
