# 01 · Arquitetura

## Visão
```
[ App Expo (telas em app/) ] --fetch /api/*--> [ Servidor Expo Router: app/api/**/+api.ts ]
         |                                         |--Prisma--> [ MongoDB Atlas ]
         |                                         |--Better Auth (sessões, OAuth)
         |                                         \--Resend (e-mails)
         \--expo-notifications (locais) <-- [ Expo Push Service ] <-- rotas de API (pushes remotos)
```
Um único projeto Expo contém app e backend. O mesmo código TypeScript e os mesmos schemas Zod servem os dois lados. O app funciona offline para marcar hábitos: grava no store local e sincroniza quando houver rede.

## Expo Router full stack (API Routes)
- `app.json`: `"web": { "output": "server" }` e plugin `expo-router` com `"origin"` (URL de produção; usado para resolver `fetch("/api/...")` nativo). Consulte a documentação atual de "API Routes" do Expo Router, pois a configuração pode mudar entre SDKs.
- Cada arquivo `app/api/**/+api.ts` exporta funções nomeadas por método HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) com assinatura `(request: Request, params: Record<string,string>) => Response` (Web Standard Request/Response). Arquivos `+api.ts` não entram no bundle do cliente.
- Rotas dinâmicas: `habits/[id]+api.ts`; catch-all: `auth/[...auth]+api.ts`.
- Em desenvolvimento, `bunx expo start` serve as rotas junto com o app. Em produção o servidor é gerado com `bunx expo export --platform web` e hospedado (ver abaixo). O app nativo aponta para o servidor por `EXPO_PUBLIC_API_URL`.
- **Fronteira cliente/servidor**: código de servidor fica em `src/server/` e só é importado por arquivos `+api.ts`. Variáveis sem prefixo `EXPO_PUBLIC_` existem apenas no servidor. Nunca importar `src/server` de uma tela.

### Hospedagem e riscos (decidir na Fase 0)
- **EAS Hosting** (`eas deploy`) é o caminho padrão do Expo. Ele roda em ambiente de edge/worker. **Verifique antes de avançar** se Prisma 6 com MongoDB (driver com conexão TCP e engine do Prisma) e Resend funcionam nesse ambiente. Se não funcionarem, use um servidor Node: o Expo oferece adaptadores de servidor (por exemplo Express) para hospedar o build em Node (Railway, Fly.io, Render ou VPS). A estrutura de código não muda; só o deploy.
- Reutilizar uma única instância de `PrismaClient` por processo (`src/server/db.ts`) e pool de conexões do MongoDB Atlas adequado ao modelo de hospedagem.
- Limite de taxa em memória não funciona em ambientes sem estado; use o rate limit do Better Auth com armazenamento em banco e um contador em MongoDB para as demais rotas.
- Variáveis secretas configuradas no host (EAS: `eas env:create`), nunca no bundle do cliente.

## Estrutura do projeto
```
vezzo/
  app.json  package.json  tsconfig.json  eslint.config.js  .env
  prisma/ schema.prisma  seed.ts
  app/
    _layout.tsx
    (auth)/ welcome.tsx  sign-in.tsx  sign-up.tsx
            forgot-password.tsx  check-email.tsx  reset-password.tsx
    (onboarding)/ name.tsx  activities.tsx  goals.tsx
    (tabs)/ index.tsx (Hoje)  progress.tsx  habits.tsx  profile.tsx
    habit/[id].tsx  habit/new.tsx  habit/[id]/edit.tsx
    streak.tsx  theme.tsx
    api/
      auth/[...auth]+api.ts           Better Auth (GET e POST)
      v1/
        catalog+api.ts  profile+api.ts  stats+api.ts  account+api.ts
        onboarding/complete+api.ts
        habits/index+api.ts  habits/[id]+api.ts
        logs/index+api.ts  logs/batch+api.ts
        push/register+api.ts
  src/
    shared/    schemas/*.ts  tokens.ts  categories.ts  emojis.ts  stats.ts  index.ts
    server/    db.ts  auth.ts  http.ts (withSession, body, query, json, errors, rateLimit)
               email/ send.ts  templates/*
    api/       cliente HTTP tipado (fetch + schemas Zod)
    auth/      authClient (Better Auth)
    components/ ui/ (Button, Card, Chip, Ring, BarChart, EmojiPicker...)
    features/  habits/ onboarding/ stats/ notifications/ theme/
    i18n/      pt-BR.ts en.ts
    store/     useThemeStore  useOnboardingStore  useHabitsStore  useSyncStore
    lib/       dates.ts  streak.ts
```
Exemplo de rota:
```ts
// app/api/v1/logs/index+api.ts
import { withSession, json } from "@/server/http";
import { logUpsert } from "@/shared/schemas";
import { prisma } from "@/server/db";

export const PUT = withSession(async ({ userId, body }) => {
  const input = body(logUpsert);          // valida com Zod; responde 400 se inválido
  const log = await upsertLog(prisma, userId, input);
  return json(log);
});
```
`withSession` lê a sessão do Better Auth a partir dos cabeçalhos da requisição, responde 401 sem sessão e padroniza erros (`docs/03-api.md`).

## Navegação (Expo Router)
- Grupo `(auth)`: sem sessão. `(onboarding)`: sessão e `Profile.onboardingDone = false`. `(tabs)`: sessão e onboarding concluído.
- Guarda em `app/_layout.tsx`: lê `authClient.useSession()` e `useOnboardingStore`; redireciona com `<Redirect />`.
- Abas (bottom bar flutuante, 68 pt): Hoje, Progresso, Hábitos, Perfil.
- Tela de tema é aberta a partir de Perfil. Detalhe do hábito e sequência abrem em pilha.

## Fluxo de dados
1. Login: Better Auth cria sessão, token fica no SecureStore (plugin Expo).
2. `GET /profile` e `GET /habits` hidratam os stores.
3. Marcar hábito: atualização otimista no store, entrada na fila de sincronização, `POST /logs`.
4. Resumos diário e semanal são calculados no cliente a partir dos logs em cache (funções puras em `src/shared/stats.ts`, testadas). A API oferece `GET /stats` para conferência e para widgets futuros.

## Bibliotecas adicionais recomendadas
`expo-router`, `expo-secure-store`, `expo-notifications`, `expo-device`, `expo-localization`, `expo-apple-authentication`, `expo-auth-session` ou fluxo OAuth do Better Auth, `react-native-mmkv` (persistência do Zustand), `react-native-reanimated`, `react-native-svg` (anel e gráficos), `date-fns`, `i18n-js`, `@react-native-community/netinfo`, `emoji-picker` nativo (ver `docs/05-telas.md`, criar hábito). Testes: `vitest` para `packages/shared` e `apps/api`; `jest-expo` para o app.
