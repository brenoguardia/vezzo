import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { i18n } from "@/i18n";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { DayPills } from "./DayPills";
import { Field } from "./Field";
import { PasswordField } from "./PasswordField";
import { ProgressSteps } from "./ProgressSteps";
import { Skeleton, SkeletonGroup } from "./Skeleton";
import { Stepper } from "./Stepper";
import { AppShellSkeleton, HabitsListSkeleton, TodaySkeleton } from "./skeletons";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("componentes base", () => {
  it("Button não dispara onPress quando desabilitado", async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("Button dispara onPress", async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("Field exibe o erro", async () => {
    await render(<Field label="E-mail" value="" onChangeText={() => {}} error="E-mail inválido" />);
    expect(screen.getByText("E-mail inválido")).toBeTruthy();
  });

  it("PasswordField alterna a visibilidade", async () => {
    await render(
      <PasswordField label="Senha" value="x" onChangeText={() => {}} showLabel="Mostrar" hideLabel="Ocultar" />,
    );
    expect(screen.getByLabelText("Senha").props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByRole("button", { name: "Mostrar" }));
    expect(screen.getByLabelText("Senha").props.secureTextEntry).toBe(false);
  });

  it("Chip informa o estado selecionado", async () => {
    await render(<Chip label="Água" selected />);
    expect(screen.getByRole("button", { name: "Água" }).props.accessibilityState).toMatchObject({ selected: true });
  });

  it("DayPills adiciona e remove dias mantendo a ordem", async () => {
    const onChange = jest.fn();
    await render(<DayPills labels={["S", "T", "Q", "Q", "S", "S", "D"]} value={[0, 4]} onChange={onChange} />);
    await fireEvent.press(screen.getAllByRole("button")[2]!);
    expect(onChange).toHaveBeenLastCalledWith([0, 2, 4]);
    await fireEvent.press(screen.getAllByRole("button")[0]!);
    expect(onChange).toHaveBeenLastCalledWith([4]);
  });

  it("Stepper chama incremento e decremento", async () => {
    const dec = jest.fn();
    const inc = jest.fn();
    await render(
      <Stepper value="2 L" onDecrement={dec} onIncrement={inc} decrementLabel="Diminuir" incrementLabel="Aumentar" />,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Aumentar" }));
    await fireEvent.press(screen.getByRole("button", { name: "Diminuir" }));
    expect(inc).toHaveBeenCalledTimes(1);
    expect(dec).toHaveBeenCalledTimes(1);
  });

  it("ProgressSteps expõe etapa atual", async () => {
    await render(<ProgressSteps current={2} accessibilityLabel="Etapa 2 de 3" />);
    expect(screen.getByRole("progressbar").props.accessibilityValue).toMatchObject({ now: 2, max: 3 });
  });
});

describe("skeleton", () => {
  beforeEach(() => {
    i18n.locale = "pt-BR";
  });

  it("o grupo é um único item de carregamento para o leitor de tela", async () => {
    await render(
      <SkeletonGroup>
        <Skeleton height={20} />
        <Skeleton height={20} />
      </SkeletonGroup>,
    );
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
    expect(screen.getByLabelText("Carregando")).toBeTruthy();
  });

  it.each([
    ["Hoje", <TodaySkeleton key="a" />, "skeleton-today"],
    ["Hábitos", <HabitsListSkeleton key="b" />, "skeleton-habits"],
    ["abertura do app", <AppShellSkeleton key="c" />, "skeleton-app"],
  ])("composição de %s renderiza com rótulo de carregamento", async (_name, element, testID) => {
    await render(element);
    expect(screen.getByTestId(testID)).toBeTruthy();
    expect(screen.getByLabelText("Carregando")).toBeTruthy();
  });
});
