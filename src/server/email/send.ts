import { Resend } from "resend";
import { type EmailData, type EmailLocale, type EmailTemplate, renderEmail } from "./templates";

type SendResult = { data: unknown; error: { message: string } | null };

export type EmailClient = {
  emails: {
    send: (message: { from: string; to: string; subject: string; html: string; text: string }) => Promise<SendResult>;
  };
};

export type SendEmailInput = {
  to: string;
  template: EmailTemplate;
  locale: EmailLocale;
  data: EmailData;
};

type Deps = { client: EmailClient; from: string; logger: { error: (...args: unknown[]) => void } };

/**
 * Envia e-mail transacional. Nunca lança: falha de envio não pode vazar na UI (docs/04).
 * Tenta duas vezes e registra em log, sem dados sensíveis (link/token).
 */
export function createSendEmail({ client, from, logger }: Deps) {
  return async function sendEmail(input: SendEmailInput): Promise<void> {
    const { subject, html, text } = renderEmail(input.template, input.locale, input.data);
    let reason = "";
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await client.emails.send({ from, to: input.to, subject, html, text });
        if (!result.error) return;
        reason = result.error.message;
      } catch (error) {
        reason = error instanceof Error ? error.message : "erro desconhecido";
      }
    }
    logger.error("[email] falha ao enviar", { template: input.template, reason });
  };
}

let defaultSend: ReturnType<typeof createSendEmail> | undefined;

/** Instância padrão (lazy: lê as variáveis de ambiente na primeira chamada). */
export function sendEmail(input: SendEmailInput): Promise<void> {
  defaultSend ??= createSendEmail({
    client: new Resend(process.env.RESEND_API_KEY) as unknown as EmailClient,
    from: process.env.EMAIL_FROM ?? "Vezzo <onboarding@resend.dev>",
    logger: console,
  });
  return defaultSend(input);
}
