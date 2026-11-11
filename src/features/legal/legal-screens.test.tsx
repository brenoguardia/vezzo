import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import Privacy from "@/app/(legal)/privacy";
import Terms from "@/app/(legal)/terms";
import { i18n } from "@/i18n";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("telas legais (públicas)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    i18n.locale = "pt-BR";
  });

  it("Termos de Uso renderiza título, data e seções em pt-BR", async () => {
    await render(<Terms />);
    expect(screen.getByRole("header", { name: "Termos de Uso" })).toBeTruthy();
    expect(screen.getByText(/Atualizado em/)).toBeTruthy();
    expect(screen.getByRole("header", { name: "1. Aceite" })).toBeTruthy();
  });

  it("Política de Privacidade renderiza em inglês quando o idioma é en", async () => {
    i18n.locale = "en";
    await render(<Privacy />);
    expect(screen.getByRole("header", { name: "Privacy Policy" })).toBeTruthy();
    expect(screen.getByRole("header", { name: "1. Who we are" })).toBeTruthy();
  });

  it("voltar usa o histórico quando existe", async () => {
    await render(<Terms />);
    await fireEvent.press(screen.getByLabelText("Voltar"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("voltar sem histórico (acesso direto na web) vai para a raiz", async () => {
    mockRouter.canGoBack.mockReturnValueOnce(false);
    await render(<Terms />);
    await fireEvent.press(screen.getByLabelText("Voltar"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });
});
