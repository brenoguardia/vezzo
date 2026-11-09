# CLAUDE.md: Vezzo

App de hábitos. Leia `README.md` e `docs/` antes de implementar. A referência visual é `design/Vezzo Habit App.dc.html` e as capturas em `screenshots/` (HTML apenas para consulta).

## Stack
React Native + Expo (SDK mais recente) com **Expo Router full stack**: telas em `src/app/` e API em `src/app/api/**/+api.ts`. React Hook Form, Zustand, Zod, Better Auth (+ `@better-auth/expo`), Prisma 6 + MongoDB, Resend, `expo-notifications`. Projeto único, sem monorepo e sem servidor separado.

## Estrutura
```
src/app/             telas (Expo Router) e rotas de API (src/app/api/**/+api.ts)
src/shared/          schemas Zod, tipos, constantes, stats (importável por cliente e servidor)
src/server/          SOMENTE servidor: prisma, auth, resend, helpers de rota
src/...              cliente: api, auth, components, features, i18n, store, lib
prisma/              schema.prisma e seed
```

## Regras
1. TypeScript estrito. Sem `any`. Sem `// @ts-ignore`.
2. Todo dado que cruza a rede tem schema Zod em `src/shared`. Rotas de API e cliente importam o mesmo schema.
3. Formulários: React Hook Form + `zodResolver`. Nunca validar à mão.
4. Zustand só para estado de cliente (tema, onboarding em andamento, cache de hábitos, fila de sincronização). Dados do servidor são carregados pelo cliente de API (`src/api`) e gravados no store.
5. **Fronteira cliente/servidor**: `@prisma/client`, `resend`, `better-auth` (instância de servidor) e variáveis secretas só podem ser importados em `src/app/**/+api.ts` e `src/server/**`. Telas e `src/**` fora de `src/server` nunca os importam. Garanta com a regra ESLint `no-restricted-imports`.
6. Auth exclusivamente via Better Auth. Não criar fluxo próprio de sessão ou hash de senha.
7. Estilo: tokens de `src/shared/tokens.ts`. Sem cores soltas no JSX. Tema (cor de destaque e modo) vem do store.
8. Textos em i18n (`pt-BR` padrão, `en`). Sem string fixa em componente.
9. Datas de hábito são strings locais `YYYY-MM-DD` no fuso do usuário (`Profile.timezone`). Nunca comparar por `Date` UTC.
10. Layout adaptativo por largura (`useWindowDimensions`), nunca por modelo de aparelho.
11. Mínimo de 44 pt de área de toque.
12. Funcionalidade nova vem com testes de unidade das regras de negócio (sequência, resumo semanal, agendamento de lembretes) e, para rotas, testes de autorização.
13. Toda rota de API usa o helper `withSession` + validação Zod (`src/server/http.ts`). O `userId` vem sempre da sessão.

## Gerenciador de pacotes: Bun
Use **somente Bun** (`bun.lock` é o lockfile; não gerar `package-lock.json`, `yarn.lock` nem `pnpm-lock.yaml`).
- Instalar: `bun install`. Adicionar: `bun add <pkg>` / `bun add -d <pkg>`. Dependências nativas do Expo: `bunx expo install <pkg>` (escolhe a versão compatível com o SDK).
- Executar binários: `bunx` (equivalente ao `npx`). Scripts do `package.json`: `bun run <script>`.
- Testes: rode `bun run test` (script que chama Vitest e jest-expo). **Não use `bun test`**: ele aciona o executor de testes do próprio Bun, que não substitui o jest-expo.
- Prisma: `bunx prisma ...`. Configure `"postinstall": "prisma generate"` no `package.json`.
- EAS Build reconhece `bun.lock` e instala com Bun. Use a versão do Bun fixada em `package.json` (`"packageManager": "bun@<versão>"`) e em `eas.json` se necessário.

## Comandos esperados
```
bun install
bunx prisma generate
bunx prisma db push
bunx prisma db seed
bunx expo start            # app + rotas de API em desenvolvimento
bunx expo start --dev-client
bun run typecheck
bun run test
bun run lint
```

## Variáveis de ambiente (nunca commitar; `.env` local, segredos no host)
Servidor: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, `APPLE_APP_BUNDLE_IDENTIFIER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `EXPO_ACCESS_TOKEN`.
Cliente (públicas, sem segredos): `EXPO_PUBLIC_API_URL` (URL de produção do servidor).

## Definição de pronto
Tipos passam, testes passam, a tela bate com o design (tokens, espaçamentos, textos pt/en) e funciona em claro e escuro com qualquer cor de destaque.
