# 04 · Autenticação, OAuth e e-mail

Fonte de verdade: documentação atual do Better Auth (integrações Expo, Prisma e e-mail). Consulte-a antes de implementar; nomes de opções podem mudar entre versões.

## Servidor (`src/server/auth.ts`, importado só por arquivos `+api.ts`)
```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { prisma } from "./db";
import { sendEmail } from "./email/send";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: ["vezzo://", "exp://"],           // esquema do app; Expo Go só em dev
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30,            // 30 min
    sendResetPassword: async ({ user, url }) =>
      sendEmail({ to: user.email, template: "reset-password", data: { url } }),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) =>
      sendEmail({ to: user.email, template: "verify-email", data: { url } }),
  },
  socialProviders: {
    apple:  { clientId: process.env.APPLE_CLIENT_ID!, clientSecret: process.env.APPLE_CLIENT_SECRET!,
              appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER },
    google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! },
  },
  databaseHooks: { user: { create: { after: async (user) => {
    await prisma.profile.create({ data: { userId: user.id, displayName: user.name ?? "" } });
  } } } },
});
```
Monte como rota do Expo Router:
```ts
// src/app/api/auth/[...auth]+api.ts
import { auth } from "@/server/auth";
export const GET = (request: Request) => auth.handler(request);
export const POST = (request: Request) => auth.handler(request);
```
Configure `trustedOrigins` com o esquema do app e a origem web. Habilite o rate limit do Better Auth com armazenamento em banco.

## Cliente (`src/auth/client.ts`)
```ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [expoClient({ scheme: "vezzo", storagePrefix: "vezzo", storage: SecureStore })],
});
```
Em `app.json`: `"scheme": "vezzo"`. Requisições à API usam `authClient.getCookie()` no cabeçalho `Cookie` (padrão do plugin Expo).

## Fluxos
**Cadastro (e-mail):** `signUp.email({ email, password, name })` → e-mail de verificação (Resend) → link abre `vezzo://verify-email` ou página web da API → login → onboarding.

**Login:** `signIn.email`. Erros mapeados para mensagens do formulário (credenciais inválidas, e-mail não verificado com botão "Reenviar").

**Apple e Google:** `signIn.social({ provider, callbackURL: "/" })`. No iOS, Apple é obrigatória se houver outro login social (regra da App Store). Use o botão oficial (`expo-apple-authentication` `AppleAuthenticationButton`) e o botão/guidelines oficiais do Google. Configurar: Apple (Services ID, chave privada, bundle id), Google (OAuth client iOS, Android e Web; redirect URI da API).

**Redefinir senha (3 telas do design):**
1. `forgot-password`: campo e-mail (RHF + Zod). Chama `authClient.requestPasswordReset({ email, redirectTo: "vezzo://reset-password" })`. A resposta da UI é sempre a mesma (não revela se o e-mail existe). Navega para `check-email`.
2. `check-email`: mostra o e-mail, "Abrir app de e-mail" (`Linking.openURL("message:")` no iOS), "Reenviar link" com contagem de 60 s.
3. `reset-password`: recebe `token` pelo deep link `vezzo://reset-password?token=...`. Formulário nova senha + confirmação com checklist ao vivo (mínimo de 8 caracteres, letra e número, senhas coincidem). Envia `authClient.resetPassword({ newPassword, token })`. Sucesso: toast, volta ao login. Token inválido ou expirado: estado de erro com botão para pedir novo link.
- Perfil → Conta e segurança → "Redefinir senha": para quem está logado, dispara o mesmo e-mail para o endereço da conta e vai para `check-email`. Contas só com Apple/Google não mostram essa linha.

## Resend (`src/server/email/`)
- `sendEmail({ to, template, data })` usa `resend.emails.send({ from: process.env.EMAIL_FROM, ... })`.
- Templates (React Email ou HTML simples) em pt-BR e en, escolhidos por `Profile.language` quando existir, senão pelo cabeçalho `Accept-Language`: `verify-email`, `reset-password`, `password-changed` (aviso após troca).
- Visual do e-mail: fundo `#f6f4ee`, cartão branco, botão na cor `#b9d94c` com texto `#14170c`, marca Vezzo no topo.
- Domínio de envio verificado no Resend (SPF, DKIM). Em dev, usar `onboarding@resend.dev`.
- Falha de envio não pode vazar na UI; registrar em log e retentar uma vez.

## Segurança
- Rate limit em `/api/auth/*`. Bloqueio progressivo após falhas de login.
- Senha nunca é registrada em log. Cookies/sessão em SecureStore.
- Exclusão de conta (`DELETE /v1/account`) remove `User`, `Session`, `Account`, `Profile`, `Habit`, `HabitLog`, `PushToken` e pede reautenticação recente.
- Política de privacidade e termos linkados na tela de criar conta antes de publicar.
