import { describe, expect, it, vi } from "vitest";
import { createSendEmail, type EmailClient } from "./send";

const base = { from: "Vezzo <onboarding@resend.dev>", logger: { error: vi.fn() } };

function client(send: EmailClient["emails"]["send"]): EmailClient {
  return { emails: { send } };
}

describe("sendEmail", () => {
  it("envia pelo Resend com from, assunto e corpo renderizados", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "1" }, error: null });
    const sendEmail = createSendEmail({ ...base, client: client(send) });
    await sendEmail({ to: "a@b.com", template: "reset-password", locale: "en", data: { url: "https://x.test/r" } });
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0]![0];
    expect(arg).toMatchObject({ from: base.from, to: "a@b.com" });
    expect(arg.subject).toMatch(/password/i);
    expect(arg.html).toContain("https://x.test/r");
    expect(arg.text).toContain("https://x.test/r");
  });

  it("retenta uma vez quando o Resend devolve erro", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
      .mockResolvedValueOnce({ data: { id: "2" }, error: null });
    const sendEmail = createSendEmail({ ...base, client: client(send) });
    await sendEmail({ to: "a@b.com", template: "password-changed", locale: "pt-BR", data: {} });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("retenta uma vez quando o envio lança exceção", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("rede"))
      .mockResolvedValueOnce({ data: { id: "3" }, error: null });
    const sendEmail = createSendEmail({ ...base, client: client(send) });
    await sendEmail({ to: "a@b.com", template: "password-changed", locale: "pt-BR", data: {} });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("não propaga falha após a segunda tentativa; registra em log sem o link", async () => {
    const logger = { error: vi.fn() };
    const send = vi.fn().mockResolvedValue({ data: null, error: { message: "down" } });
    const sendEmail = createSendEmail({ from: base.from, logger, client: client(send) });
    await expect(
      sendEmail({
        to: "a@b.com",
        template: "reset-password",
        locale: "en",
        data: { url: "https://x.test/secret-token" },
      }),
    ).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalled();
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("secret-token");
  });
});
