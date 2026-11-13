import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";
import { i18n } from "@/i18n";
import { STORE_LINKS } from "@/shared/landing";
import { ACCENTS, DEFAULT_ACCENT } from "@/shared/tokens";
import { useThemeStore } from "@/store/theme";
import { LandingScreen } from "./LandingScreen";

jest.mock("expo-router", () => {
  const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <Text accessibilityHint={href}>{children}</Text>
    ),
  };
});

describe("LandingScreen", () => {
  beforeEach(() => {
    i18n.locale = "pt-BR";
  });
  afterEach(() => {
    STORE_LINKS.appStore = null;
    STORE_LINKS.playStore = null;
    jest.restoreAllMocks();
  });

  it("apresenta o app em pt-BR com título, funções e rodapé legal", async () => {
    await render(<LandingScreen />);
    expect(screen.getByRole("header", { name: /Rotina simples/ })).toBeTruthy();
    expect(screen.getByRole("header", { name: "Veja a sequência crescer" })).toBeTruthy();
    expect(screen.getByText("Termos de Uso")).toBeTruthy();
    expect(screen.getByText("Excluir conta")).toBeTruthy();
  });

  it("renderiza em inglês quando o idioma é en", async () => {
    i18n.locale = "en";
    await render(<LandingScreen />);
    expect(screen.getByRole("header", { name: /Simple routine/ })).toBeTruthy();
    expect(screen.getByRole("header", { name: "Works offline" })).toBeTruthy();
  });

  it("a demo do Hoje reage ao toque: anel, mensagem e sequência", async () => {
    await render(<LandingScreen />);
    expect(screen.getByText("3/5")).toBeTruthy();
    expect(screen.getByText("Sequência de 12 dias")).toBeTruthy();
    await fireEvent.press(screen.getByRole("checkbox", { name: /Beber água/ }));
    await fireEvent.press(screen.getByRole("checkbox", { name: /Ler/ }));
    expect(screen.getByText("5/5")).toBeTruthy();
    expect(screen.getByText("Dia completo. Até amanhã!")).toBeTruthy();
    expect(screen.getByText("Sequência de 13 dias")).toBeTruthy();
    await fireEvent.press(screen.getByRole("checkbox", { name: /Ler/ }));
    expect(screen.getByText("4/5")).toBeTruthy();
    expect(screen.getByText("Sequência de 12 dias")).toBeTruthy();
  });

  it("escolher uma cor de destaque troca o tema da página", async () => {
    await render(<LandingScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Cor de destaque 3" }));
    expect(useThemeStore.getState().accent).toBe(ACCENTS[2]);
    expect(screen.getByRole("radio", { name: "Cor de destaque 3" }).props.accessibilityState).toMatchObject({
      selected: true,
    });
    useThemeStore.getState().setAccent(DEFAULT_ACCENT);
  });

  it("lembrete: concluir, adiar e pular mostram o resultado; tocar de novo desfaz", async () => {
    await render(<LandingScreen />);
    expect(screen.getByText("Meta de hoje: 2,5 L. Você já bebeu 1,8 L.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Concluir" }));
    expect(screen.getByText("Beber água concluído. Boa!")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Adiar 1 h" }));
    expect(screen.getByText("Combinado: aviso de novo em 1 hora.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Adiar 1 h" }));
    expect(screen.getByText("Meta de hoje: 2,5 L. Você já bebeu 1,8 L.")).toBeTruthy();
  });

  it("criar hábito: escolher hábito, ajustar meta e dias atualiza a prévia", async () => {
    await render(<LandingScreen />);
    expect(screen.getByText("10 min · Seg, Ter, Qua, Qui, Sex")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: /Ler/ }));
    expect(screen.getByText("15 pág. · Seg, Ter, Qua, Qui, Sex")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Aumentar meta"));
    expect(screen.getByText("20 pág. · Seg, Ter, Qua, Qui, Sex")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Sábado" }));
    await fireEvent.press(screen.getByRole("button", { name: "Domingo" }));
    expect(screen.getByText("20 pág. · Todo dia")).toBeTruthy();
  });

  it("criar hábito: o último dia ativo não pode ser desmarcado", async () => {
    await render(<LandingScreen />);
    for (const day of ["Terça", "Quarta", "Quinta", "Sexta", "Segunda"])
      await fireEvent.press(screen.getByRole("button", { name: day }));
    expect(screen.getByText("10 min · Seg")).toBeTruthy();
  });

  it("sequência: marcar e desmarcar dias muda o número, a mensagem e as conquistas", async () => {
    await render(<LandingScreen />);
    expect(screen.getByTestId("streak-number").props.children).toBe(12);
    expect(screen.getByText("12/15")).toBeTruthy();
    await fireEvent.press(screen.getByRole("checkbox", { name: "Quinta" }));
    expect(screen.getByTestId("streak-number").props.children).toBe(0);
    expect(screen.getByText("Comece sua sequência hoje.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("checkbox", { name: "Quinta" }));
    await fireEvent.press(screen.getByRole("checkbox", { name: "Terça" }));
    expect(screen.getByTestId("streak-number").props.children).toBe(2);
    expect(screen.getByText("2/15")).toBeTruthy();
  });

  it("sequência: dias depois de hoje não podem ser marcados", async () => {
    await render(<LandingScreen />);
    expect(screen.getByRole("checkbox", { name: "Sexta" }).props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("tema: o controle de aparência troca o modo da página", async () => {
    await render(<LandingScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Claro" }));
    expect(useThemeStore.getState().mode).toBe("light");
    useThemeStore.getState().setMode("system");
  });

  it("o botão de idioma alterna pt-BR e en", async () => {
    await render(<LandingScreen />);
    await fireEvent.press(screen.getByLabelText("Mudar idioma para inglês"));
    expect(i18n.locale).toBe("en");
    expect(await screen.findByRole("header", { name: /Simple routine/ })).toBeTruthy();
  });

  it("selos de loja ficam desativados com 'Em breve' enquanto não há URL", async () => {
    await render(<LandingScreen />);
    for (const badge of [...screen.getAllByTestId("badge-app-store"), ...screen.getAllByTestId("badge-play-store")])
      expect(badge.props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getAllByText("Em breve")).toHaveLength(4);
  });

  it("selo com URL abre a loja", async () => {
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue();
    STORE_LINKS.playStore = "https://play.google.com/store/apps/details?id=com.itbuilder.vezzo";
    await render(<LandingScreen />);
    const [badge] = screen.getAllByTestId("badge-play-store");
    expect(badge?.props.accessibilityState).toMatchObject({ disabled: false });
    await fireEvent.press(badge!);
    expect(open).toHaveBeenCalledWith(STORE_LINKS.playStore);
  });
});
