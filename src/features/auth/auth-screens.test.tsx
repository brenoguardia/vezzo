import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Text as MockText } from "react-native";
import { i18n } from "@/i18n";

import { authClient } from "@/auth/client";
import CheckEmail from "@/app/(recovery)/check-email";
import ForgotPassword from "@/app/(recovery)/forgot-password";
import ResetPassword from "@/app/(recovery)/reset-password";
import SignIn from "@/app/(auth)/sign-in";
import SignUp from "@/app/(auth)/sign-up";
import Welcome from "@/app/(auth)/welcome";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
let mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  Redirect: ({ href }: { href: string }) => {
    return <MockText>redirect:{href}</MockText>;
  },
  Link: ({ children }: { children: ReactNode }) => children,
}));
jest.mock("expo-apple-authentication", () => ({
  isAvailableAsync: () => Promise.resolve(false),
  signInAsync: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/auth/client", () => ({
  authClient: {
    signIn: { email: jest.fn(), social: jest.fn() },
    signUp: { email: jest.fn() },
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    sendVerificationEmail: jest.fn(),
    useSession: () => ({ data: null, isPending: false }),
  },
}));

// Os métodos do client são `jest.fn()` (ver mock acima); o cast evita tipar a API inteira do Better Auth.
type Mock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;
const mockAuth = authClient as unknown as {
  signIn: { email: Mock; social: Mock };
  signUp: { email: Mock };
  requestPasswordReset: Mock;
  resetPassword: Mock;
  sendVerificationEmail: Mock;
};

const OK = { data: {}, error: null };

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  i18n.locale = "pt-BR";
});

describe("welcome", () => {
  it("leva para criar conta e login", async () => {
    await render(<Welcome />);
    await fireEvent.press(screen.getByText("Criar conta"));
    expect(mockRouter.push).toHaveBeenCalledWith("/sign-up");
    await fireEvent.press(screen.getByText("Já tenho conta"));
    expect(mockRouter.push).toHaveBeenCalledWith("/sign-in");
  });
});

describe("sign-up", () => {
  it("mantém Continuar desabilitado até o formulário ser válido e mostra erro i18n", async () => {
    await render(<SignUp />);
    const button = () => screen.getByRole("button", { name: "Continuar" });
    expect(button()).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText("E-mail"), "ana");
    await fireEvent.changeText(screen.getByLabelText("Senha"), "curta");
    await waitFor(() => expect(screen.getByText("Informe um e-mail válido.")).toBeTruthy());
    expect(screen.getByText("A senha precisa ter ao menos 8 caracteres.")).toBeTruthy();
    expect(button()).toBeDisabled();
  });

  it("cria a conta e vai para a confirmação de e-mail", async () => {
    mockAuth.signUp.email.mockResolvedValue(OK);
    await render(<SignUp />);
    await fireEvent.changeText(screen.getByLabelText("E-mail"), " Ana@Exemplo.com ");
    await fireEvent.changeText(screen.getByLabelText("Senha"), "senha1234");
    await waitFor(() => expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled());
    await fireEvent.press(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/check-email",
        params: { email: "ana@exemplo.com", purpose: "verify" },
      }),
    );
    expect(mockAuth.signUp.email).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@exemplo.com", password: "senha1234" }),
    );
  });

  it("mostra erro de e-mail já cadastrado no campo", async () => {
    mockAuth.signUp.email.mockResolvedValue({ data: null, error: { code: "USER_ALREADY_EXISTS", status: 422 } });
    await render(<SignUp />);
    await fireEvent.changeText(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await fireEvent.changeText(screen.getByLabelText("Senha"), "senha1234");
    await waitFor(() => expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled());
    await fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() => expect(screen.getByText("Já existe uma conta com este e-mail.")).toBeTruthy());
  });
});

describe("sign-in", () => {
  async function fillAndSubmit() {
    await fireEvent.changeText(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await fireEvent.changeText(screen.getByLabelText("Senha"), "qualquer");
    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled());
    await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  }

  it("mapeia credenciais inválidas", async () => {
    mockAuth.signIn.email.mockResolvedValue({ data: null, error: { code: "INVALID_EMAIL_OR_PASSWORD", status: 401 } });
    await render(<SignIn />);
    await fillAndSubmit();
    await waitFor(() => expect(screen.getByText("E-mail ou senha incorretos.")).toBeTruthy());
  });

  it("e-mail não verificado oferece reenviar confirmação", async () => {
    mockAuth.signIn.email.mockResolvedValue({ data: null, error: { code: "EMAIL_NOT_VERIFIED", status: 403 } });
    mockAuth.sendVerificationEmail.mockResolvedValue(OK);
    await render(<SignIn />);
    await fillAndSubmit();
    await fireEvent.press(await screen.findByText("Reenviar e-mail de confirmação"));
    await waitFor(() =>
      expect(mockAuth.sendVerificationEmail).toHaveBeenCalledWith({ email: "ana@exemplo.com", callbackURL: "/" }),
    );
  });
});

describe("forgot-password", () => {
  it("segue para check-email mesmo quando a conta não existe (sem revelar)", async () => {
    mockAuth.requestPasswordReset.mockResolvedValue({ data: null, error: { code: "USER_NOT_FOUND", status: 404 } });
    await render(<ForgotPassword />);
    await fireEvent.changeText(screen.getByLabelText("E-mail"), "naoexiste@exemplo.com");
    await waitFor(() => expect(screen.getByRole("button", { name: "Enviar link" })).toBeEnabled());
    await fireEvent.press(screen.getByRole("button", { name: "Enviar link" }));
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/check-email",
        params: { email: "naoexiste@exemplo.com", purpose: "reset" },
      }),
    );
    expect(mockAuth.requestPasswordReset).toHaveBeenCalledWith({
      email: "naoexiste@exemplo.com",
      redirectTo: "vezzo://reset-password",
    });
  });
});

describe("check-email", () => {
  it("mostra o e-mail, a validade e a contagem de 60 s para reenviar", async () => {
    mockParams = { email: "ana@exemplo.com", purpose: "reset" };
    await render(<CheckEmail />);
    expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
    expect(screen.getByText("O link vale por 30 minutos.")).toBeTruthy();
    expect(screen.getByText("Reenviar link em 60 s")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reenviar link em/ })).toBeDisabled();
  });

  it("sem e-mail volta para forgot-password", async () => {
    await render(<CheckEmail />);
    expect(screen.getByText("redirect:/forgot-password")).toBeTruthy();
  });
});

describe("reset-password", () => {
  it("sem token mostra o estado de link inválido com pedido de novo link", async () => {
    await render(<ResetPassword />);
    expect(screen.getByText("Link inválido ou expirado")).toBeTruthy();
    await fireEvent.press(screen.getByText("Pedir novo link"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/forgot-password");
  });

  it("checklist reage ao vivo e salva com o token do deep link", async () => {
    mockParams = { token: "tok123" };
    mockAuth.resetPassword.mockResolvedValue(OK);
    await render(<ResetPassword />);
    const check = (label: string) => screen.getByLabelText(label);
    expect(check("As senhas coincidem").props.accessibilityState).toEqual({ checked: false });

    await fireEvent.changeText(screen.getByLabelText("Nova senha"), "senha1234");
    await fireEvent.changeText(screen.getByLabelText("Confirmar senha"), "senha1234");
    await waitFor(() => expect(check("As senhas coincidem").props.accessibilityState).toEqual({ checked: true }));
    expect(check("Mínimo de 8 caracteres").props.accessibilityState).toEqual({ checked: true });

    await waitFor(() => expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeEnabled());
    await fireEvent.press(screen.getByRole("button", { name: "Salvar nova senha" }));
    await waitFor(() => expect(mockAuth.resetPassword).toHaveBeenCalledWith({ newPassword: "senha1234", token: "tok123" }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/sign-in"));
  });

  it("token rejeitado pelo servidor vira o estado de erro", async () => {
    mockParams = { token: "vencido" };
    mockAuth.resetPassword.mockResolvedValue({ data: null, error: { code: "INVALID_TOKEN", status: 400 } });
    await render(<ResetPassword />);
    await fireEvent.changeText(screen.getByLabelText("Nova senha"), "senha1234");
    await fireEvent.changeText(screen.getByLabelText("Confirmar senha"), "senha1234");
    await waitFor(() => expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeEnabled());
    await fireEvent.press(screen.getByRole("button", { name: "Salvar nova senha" }));
    await waitFor(() => expect(screen.getByText("Link inválido ou expirado")).toBeTruthy());
  });
});
