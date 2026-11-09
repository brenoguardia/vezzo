export type EmailLocale = "pt-BR" | "en";
export type EmailTemplate = "verify-email" | "reset-password" | "password-changed";
export type EmailData = { url?: string };
export type RenderedEmail = { subject: string; html: string; text: string };

export function resolveLocale(input: { profileLanguage?: string | null; acceptLanguage?: string | null }): EmailLocale {
  const fromProfile = input.profileLanguage;
  if (fromProfile === "en" || fromProfile === "pt-BR") return fromProfile;
  const first = input.acceptLanguage?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("en")) return "en";
  return "pt-BR";
}

type Copy = { subject: string; title: string; body: string; cta?: string; footer: string };

const COPY: Record<EmailTemplate, Record<EmailLocale, Copy>> = {
  "verify-email": {
    "pt-BR": {
      subject: "Confirme seu e-mail no Vezzo",
      title: "Confirme seu e-mail",
      body: "Falta só um passo para começar a criar seus hábitos. Toque no botão para confirmar seu endereço de e-mail.",
      cta: "Confirmar e-mail",
      footer: "Se você não criou uma conta no Vezzo, ignore esta mensagem.",
    },
    en: {
      subject: "Confirm your email on Vezzo",
      title: "Confirm your email",
      body: "One last step before you start building habits. Tap the button to confirm your email address.",
      cta: "Confirm email",
      footer: "If you didn't create a Vezzo account, you can ignore this message.",
    },
  },
  "reset-password": {
    "pt-BR": {
      subject: "Redefina sua senha do Vezzo",
      title: "Redefinir senha",
      body: "Recebemos um pedido para redefinir sua senha. O link vale por 30 minutos.",
      cta: "Redefinir senha",
      footer: "Se você não pediu isso, ignore esta mensagem. Sua senha continua a mesma.",
    },
    en: {
      subject: "Reset your Vezzo password",
      title: "Reset your password",
      body: "We received a request to reset your password. The link is valid for 30 minutes.",
      cta: "Reset password",
      footer: "If you didn't request this, ignore this message. Your password stays the same.",
    },
  },
  "password-changed": {
    "pt-BR": {
      subject: "Sua senha do Vezzo foi alterada",
      title: "Senha alterada",
      body: "A senha da sua conta acabou de ser alterada. Por segurança, você foi desconectado dos outros aparelhos.",
      footer: "Não foi você? Redefina sua senha agora mesmo e entre em contato com o suporte.",
    },
    en: {
      subject: "Your Vezzo password was changed",
      title: "Password changed",
      body: "Your account password was just changed. For your security, you were signed out of other devices.",
      footer: "Wasn't you? Reset your password right away and contact support.",
    },
  },
};

const BG = "#f6f4ee";
const ACCENT = "#b9d94c";
const ON_ACCENT = "#14170c";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEmail(template: EmailTemplate, locale: EmailLocale, data: EmailData): RenderedEmail {
  const copy = COPY[template][locale];
  const url = data.url;
  const button =
    copy.cta && url
      ? `<p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:${ACCENT};color:${ON_ACCENT};font-weight:600;text-decoration:none;padding:14px 24px;border-radius:12px">${escapeHtml(copy.cta)}</a></p>`
      : "";
  const html = `<!doctype html>
<html lang="${locale}"><body style="margin:0;padding:24px;background:${BG};font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:${ON_ACCENT}">
<div style="max-width:480px;margin:0 auto">
<p style="font-size:20px;font-weight:700;margin:0 0 16px">Vezzo</p>
<div style="background:#ffffff;border-radius:16px;padding:32px">
<h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(copy.title)}</h1>
<p style="font-size:16px;line-height:1.5;margin:0">${escapeHtml(copy.body)}</p>
${button}
<p style="font-size:13px;line-height:1.5;color:#5c6150;margin:0">${escapeHtml(copy.footer)}</p>
</div></div></body></html>`;
  const text = [copy.title, "", copy.body, ...(url ? ["", url] : []), "", copy.footer].join("\n");
  return { subject: copy.subject, html, text };
}
