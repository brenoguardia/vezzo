import type { Db } from "./db";
import type { SendEmailInput } from "./email/send";
import { resolveLocale, type EmailLocale } from "./email/templates";

type AuthUser = { id: string; email: string; name?: string | null };
type Deps = { db: Db; sendEmail: (input: SendEmailInput) => Promise<void> };

/** Lógica dos ganchos do Better Auth, isolada da instância para ser testável. */
export function createAuthCallbacks({ db, sendEmail }: Deps) {
  const acceptLanguage = (request?: Request) => request?.headers.get("accept-language");

  async function localeFor(user: AuthUser, request?: Request): Promise<EmailLocale> {
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    return resolveLocale({ profileLanguage: profile?.language, acceptLanguage: acceptLanguage(request) });
  }

  // Não aguardamos o envio: o tempo de resposta não deve revelar se o e-mail existe.
  function dispatch(user: AuthUser, request: Request | undefined, build: (locale: EmailLocale) => SendEmailInput) {
    void localeFor(user, request).then((locale) => sendEmail(build(locale)));
  }

  return {
    async afterUserCreate(user: AuthUser, request?: Request): Promise<void> {
      await db.profile.create({
        data: {
          userId: user.id,
          displayName: user.name ?? "",
          language: resolveLocale({ acceptLanguage: acceptLanguage(request) }),
        },
      });
    },
    async sendVerificationEmail({ user, url }: { user: AuthUser; url: string }, request?: Request): Promise<void> {
      dispatch(user, request, (locale) => ({ to: user.email, template: "verify-email", locale, data: { url } }));
    },
    async sendResetPassword({ user, url }: { user: AuthUser; url: string }, request?: Request): Promise<void> {
      dispatch(user, request, (locale) => ({ to: user.email, template: "reset-password", locale, data: { url } }));
    },
    async onPasswordReset({ user }: { user: AuthUser }, request?: Request): Promise<void> {
      dispatch(user, request, (locale) => ({ to: user.email, template: "password-changed", locale, data: {} }));
    },
  };
}
