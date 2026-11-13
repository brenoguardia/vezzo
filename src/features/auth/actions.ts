import * as AppleAuthentication from "expo-apple-authentication";
import { authClient } from "@/auth/client";
import { type AuthErrorKey, type AuthErrorLike, authErrorKey } from "@/auth/errors";
import { appUrl } from "@/auth/scheme";
import type { ForgotPasswordInput, SignInInput, SignUpInput } from "@/shared/schemas";

export type AuthResult = { ok: true } | { ok: false; key: AuthErrorKey };

export const RESET_REDIRECT = appUrl("reset-password");
/** Depois de verificar o e-mail, o servidor redireciona para o app (esquema já está em `trustedOrigins`). */
export const VERIFY_REDIRECT = appUrl();

async function run(call: () => Promise<{ error: AuthErrorLike | null }>): Promise<AuthResult> {
  try {
    const { error } = await call();
    return error ? { ok: false, key: authErrorKey(error) } : { ok: true };
  } catch {
    return { ok: false, key: "network" };
  }
}

export const signInWithEmail = ({ email, password }: SignInInput) =>
  run(() => authClient.signIn.email({ email, password }));

// O nome real vem no onboarding (`Profile.displayName`); até lá usamos a parte local do e-mail.
export const signUpWithEmail = ({ email, password }: SignUpInput) =>
  run(() =>
    authClient.signUp.email({ email, password, name: email.split("@")[0] ?? email, callbackURL: VERIFY_REDIRECT }),
  );

export const resendVerification = (email: string) =>
  run(() => authClient.sendVerificationEmail({ email, callbackURL: VERIFY_REDIRECT }));

/** A UI responde igual exista ou não a conta (docs/04); só falhas de rede/limite aparecem. */
export const requestPasswordReset = ({ email }: ForgotPasswordInput) =>
  run(() => authClient.requestPasswordReset({ email, redirectTo: RESET_REDIRECT }));

export const resetPassword = (newPassword: string, token: string) =>
  run(() => authClient.resetPassword({ newPassword, token }));

export const signInWithGoogle = () => run(() => authClient.signIn.social({ provider: "google", callbackURL: "/" }));

/** iOS: fluxo nativo da Apple; o `identityToken` é validado pelo Better Auth (`appBundleIdentifier`). */
export async function signInWithApple(): Promise<AuthResult | "cancelled"> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) return { ok: false, key: "social" };
    const token = credential.identityToken;
    return await run(() => authClient.signIn.social({ provider: "apple", idToken: { token } }));
  } catch (error) {
    if ((error as { code?: string }).code === "ERR_REQUEST_CANCELED") return "cancelled";
    return { ok: false, key: "social" };
  }
}
