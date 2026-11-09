# 10 · Plano de implementação com Claude Code

Trabalhe em fases pequenas. Em cada fase: peça um plano curto antes de codar, implemente, rode `bun run typecheck && bun run test`, revise o diff e faça commit. Mantenha `CLAUDE.md` na raiz e abra o HTML de design no navegador para conferir cada tela.

## Fase 0 · Fundação
Prompt:
> Leia CLAUDE.md e docs/01-arquitetura.md. Use Bun como gerenciador de pacotes (ver CLAUDE.md). Crie um projeto Expo único (SDK mais recente, Expo Router, TypeScript) com a estrutura da seção "Estrutura do projeto". Habilite API Routes (`web.output = "server"`), crie `src/server/http.ts` com `withSession`, `body`, `query`, `json` e tratamento de erros, e a rota `GET /api/health`. Configure alias `@/`, ESLint com `no-restricted-imports` impedindo importar `src/server`, `@prisma/client` e `resend` fora de `+api.ts` e `src/server`, Vitest e jest-expo. Faça um spike de hospedagem: publique a rota de health no EAS Hosting e confirme se Prisma + MongoDB funcionam lá; se não, configure o adaptador Node e documente a escolha. Não implemente funcionalidades ainda.

Aceite: `bun run typecheck` passa; `bun install` gera apenas `bun.lock`; app abre no simulador; `GET /api/health` responde em dev e no host escolhido; consulta de teste ao MongoDB funciona no host escolhido.

## Fase 1 · Banco e API
> Leia docs/02 e docs/03. Configure Prisma 6 com MongoDB (`src/server/db.ts` com instância única), escreva `prisma/schema.prisma` (modelos do domínio; os do Better Auth virão na fase 2), seed com categorias e templates a partir de `src/shared/categories.ts`. Implemente as rotas `src/app/api/v1/catalog`, `profile`, `habits`, `logs`, `stats` com Zod e `withSession` (sessão simulada em teste). Escreva os testes de `src/shared/stats.ts`, streak e de autorização por usuário.

## Fase 2 · Autenticação e e-mail
> Leia docs/04. Integre Better Auth com adapter Prisma (mongodb), plugin Expo, rota `src/app/api/auth/[...auth]+api.ts`, e-mail/senha com verificação e redefinição, Apple e Google. Gere os modelos com o CLI e mescle no schema. Implemente `sendEmail` com Resend e os templates verify-email, reset-password, password-changed em pt-BR e en. Crie o hook que cria `Profile` após cadastro. Teste o fluxo de redefinição de ponta a ponta com o domínio de teste do Resend.

## Fase 3 · Design tokens e componentes base
> Leia docs/06 e docs/05 (componentes recorrentes). Implemente tema (useThemeStore, useTheme), fonte Manrope e os componentes: Button, Field, PasswordField, Card, Chip, EmojiTile, Ring, BarChart, DayPills, Stepper, ProgressSteps, TabBar flutuante. Crie uma tela de playground em modo dev que exibe todos em claro e escuro com as 7 cores.

## Fase 4 · Telas de autenticação
> Leia docs/04 (fluxos) e docs/05 telas 1 a 3. Implemente welcome, sign-up, sign-in, forgot-password, check-email e reset-password com React Hook Form + Zod, deep link `vezzo://reset-password?token=`, botões Apple e Google oficiais e guarda de rotas.

## Fase 5 · Onboarding
> Leia docs/05 (tela 4) e docs/09. Implemente as três etapas com useOnboardingStore, catálogo local, steppers por unidade e `POST /v1/onboarding/complete`. Pedir permissão de notificação ao final.

## Fase 6 · Home, progresso, detalhe e criação
> Leia docs/05 telas 5 a 9. Implemente as abas Hoje e Progresso, detalhe do hábito, criar/editar hábito com seletor de emoji (pré-definidos + teclado do sistema), tela de sequência e banco de frases. Atualização otimista, fila de sincronização e `flush()` conforme docs/09.

## Fase 7 · Tema e perfil
> Leia docs/05 telas 10 e 11. Implemente a tela de tema (prévia ao vivo, persistência em `PUT /v1/profile`), perfil com seções Preferências e Conta e segurança, troca de idioma, redefinir senha logado, sair e excluir conta (`DELETE /v1/account`).

## Fase 8 · Notificações
> Leia docs/07 inteiro. Implemente permissão, canal Android, categoria HABIT_REMINDER, `rescheduleAll()`, tratamento de ações em primeiro plano e segundo plano, adiamento limitado, registro de push token e a tela de debug. Teste em development build.

## Fase 9 · Layout adaptativo
> Leia docs/08. Implemente `useLayoutMode`, `SplitView` e os layouts dual de Hoje, Progresso e onboarding. Teste em iPad e emulador de dobrável.

## Fase 10 · Qualidade e publicação
- Acessibilidade: rótulos, `accessibilityRole`, contraste das 7 cores, Dynamic Type até 130%, VoiceOver nos check circles.
- Estados vazios, erro e carregamento de `docs/05`.
- Analytics e crash reporting (escolher: Sentry).
- EAS Build, ícones e splash (arte de `06-design-tokens.md`), políticas de privacidade e termos, exclusão de conta, textos das lojas em pt-BR e en, Sign in with Apple configurado.
- Deploy do servidor Expo (`eas deploy` ou adaptador Node conforme decidido na Fase 0), variáveis de ambiente no host, `EXPO_PUBLIC_API_URL` apontando para produção, domínio e e-mail verificado no Resend.

## Dicas de uso do agente
- Uma fase por sessão. Peça "mostre o plano em tópicos antes de editar".
- Sempre aponte o doc e a tela do HTML de referência.
- Para bugs de UI, descreva a diferença contra o design (tokens e medidas já documentados).
- Peça testes junto com a funcionalidade, não depois.
