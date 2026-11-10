import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthCallbacks } from "./auth-callbacks";
import type { Db } from "./db";
import type { SendEmailInput } from "./email/send";
import { createFakeDb, type FakeDb } from "./testing/fake-db";

const user = { id: "u1", email: "ana@vezzo.test", name: "Ana" };
const reqWith = (lang?: string) =>
  new Request("http://localhost/api/auth/x", { headers: lang ? { "accept-language": lang } : {} });

let fake: FakeDb;
let sendEmail: ReturnType<typeof vi.fn<(input: SendEmailInput) => Promise<void>>>;
let cb: ReturnType<typeof createAuthCallbacks>;

beforeEach(() => {
  fake = createFakeDb();
  sendEmail = vi.fn<(input: SendEmailInput) => Promise<void>>().mockResolvedValue(undefined);
  cb = createAuthCallbacks({ db: fake as unknown as Db, sendEmail });
});

describe("afterUserCreate", () => {
  it("cria o Profile com displayName do nome do usuário", async () => {
    await cb.afterUserCreate(user, reqWith());
    const profile = await fake.profile.findUnique({ where: { userId: "u1" } });
    expect(profile).toMatchObject({ userId: "u1", displayName: "Ana", language: "pt-BR" });
  });
  it("guarda o idioma vindo de Accept-Language", async () => {
    await cb.afterUserCreate(user, reqWith("en-US,en;q=0.9"));
    expect(await fake.profile.findUnique({ where: { userId: "u1" } })).toMatchObject({ language: "en" });
  });
  it("não falha sem nome", async () => {
    await cb.afterUserCreate({ ...user, name: "" });
    expect(await fake.profile.findUnique({ where: { userId: "u1" } })).toMatchObject({ displayName: "" });
  });
});

describe("e-mails", () => {
  it("verificação usa o idioma do perfil", async () => {
    await fake.profile.create({ data: { userId: "u1", displayName: "Ana", language: "en" } });
    await cb.sendVerificationEmail({ user, url: "https://x.test/v" }, reqWith("pt-BR"));
    await vi.waitFor(() =>
      expect(sendEmail).toHaveBeenCalledWith({
        to: user.email,
        template: "verify-email",
        locale: "en",
        data: { url: "https://x.test/v" },
      }),
    );
  });
  it("redefinição cai em Accept-Language sem perfil", async () => {
    await cb.sendResetPassword({ user, url: "https://x.test/r" }, reqWith("en"));
    await vi.waitFor(() =>
      expect(sendEmail).toHaveBeenCalledWith({
        to: user.email,
        template: "reset-password",
        locale: "en",
        data: { url: "https://x.test/r" },
      }),
    );
  });
  it("aviso de senha alterada é enviado após redefinir", async () => {
    await cb.onPasswordReset({ user }, reqWith());
    await vi.waitFor(() =>
      expect(sendEmail).toHaveBeenCalledWith({
        to: user.email,
        template: "password-changed",
        locale: "pt-BR",
        data: {},
      }),
    );
  });
  it("não espera o envio terminar (evita timing attack)", async () => {
    sendEmail.mockReturnValue(new Promise(() => {}));
    await expect(cb.sendResetPassword({ user, url: "u" }, reqWith())).resolves.toBeUndefined();
  });
});
