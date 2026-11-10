import { describe, expect, it } from "vitest";
import {
  forgotPasswordInput,
  passwordChecks,
  passwordRule,
  resetPasswordInput,
  signInInput,
  signUpInput,
} from "./auth";

const messages = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.error?.issues.map((i) => i.message) ?? [];

describe("passwordRule", () => {
  it.each(["abcdefg1", "Senha123", "12345678a"])("aceita %s", (p) => {
    expect(passwordRule.safeParse(p).success).toBe(true);
  });
  it.each(["abc123", "abcdefgh", "12345678", ""])("rejeita %s", (p) => {
    expect(passwordRule.safeParse(p).success).toBe(false);
  });
});

describe("passwordChecks", () => {
  it("avalia cada regra do checklist", () => {
    expect(passwordChecks("abc", "abc")).toEqual({ length: false, charset: false, match: true });
    expect(passwordChecks("abcdefg1", "")).toEqual({ length: true, charset: true, match: false });
    expect(passwordChecks("", "")).toEqual({ length: false, charset: false, match: false });
  });
});

describe("signUpInput / signInInput", () => {
  it("normaliza o e-mail (trim + minúsculas)", () => {
    const r = signUpInput.parse({ email: "  Ana@Exemplo.COM ", password: "abcdefg1" });
    expect(r.email).toBe("ana@exemplo.com");
  });
  it("rejeita e-mail inválido com chave i18n", () => {
    expect(messages(signUpInput.safeParse({ email: "ana", password: "abcdefg1" }))).toContain("auth.errors.email");
  });
  it("rejeita senha fraca no cadastro, mas o login só exige preenchimento", () => {
    expect(signUpInput.safeParse({ email: "a@b.co", password: "abc" }).success).toBe(false);
    expect(signInInput.safeParse({ email: "a@b.co", password: "abc" }).success).toBe(true);
    expect(messages(signInInput.safeParse({ email: "a@b.co", password: "" }))).toContain(
      "auth.errors.passwordRequired",
    );
  });
});

describe("forgotPasswordInput", () => {
  it("exige e-mail válido", () => {
    expect(forgotPasswordInput.safeParse({ email: "x" }).success).toBe(false);
    expect(forgotPasswordInput.safeParse({ email: "x@y.co" }).success).toBe(true);
  });
});

describe("resetPasswordInput", () => {
  it("exige confirmação igual", () => {
    const r = resetPasswordInput.safeParse({ password: "abcdefg1", confirm: "abcdefg2" });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("auth.errors.passwordMismatch");
  });
  it("aceita senhas iguais e válidas", () => {
    expect(resetPasswordInput.safeParse({ password: "abcdefg1", confirm: "abcdefg1" }).success).toBe(true);
  });
});
