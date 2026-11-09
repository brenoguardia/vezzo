import { z } from "zod";

/** As mensagens são chaves i18n (`auth.errors.*`); a UI as traduz. */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().min(1, "auth.errors.emailRequired").email("auth.errors.email"));

export const PASSWORD_MIN_LENGTH = 8;

export const passwordRule = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "auth.errors.passwordLength")
  .regex(/[A-Za-z]/, "auth.errors.passwordCharset")
  .regex(/\d/, "auth.errors.passwordCharset");

/** Estado de cada item do checklist ao vivo da tela de nova senha. */
export function passwordChecks(password: string, confirm: string) {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    charset: /[A-Za-z]/.test(password) && /\d/.test(password),
    match: password.length > 0 && password === confirm,
  };
}

export const signUpInput = z.object({ email, password: passwordRule });
export const signInInput = z.object({
  email,
  password: z.string().min(1, "auth.errors.passwordRequired"),
});
export const forgotPasswordInput = z.object({ email });
export const resetPasswordInput = z
  .object({ password: passwordRule, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "auth.errors.passwordMismatch" });

export type SignUpInput = z.infer<typeof signUpInput>;
export type SignInInput = z.infer<typeof signInInput>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;
