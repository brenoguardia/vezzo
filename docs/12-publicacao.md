# 12 · Publicação (Fase 10)

Lista do que falta fazer fora do código. O que depende de conta, domínio ou decisão do dono do produto está marcado como **Pendente**. Nada abaixo foi executado: nenhum build, deploy ou envio às lojas.

## O que o código já entrega
- Contraste: pisos testados em `src/shared/contrast.test.ts` (4,5:1 para `accInk` sobre as 7 cores e para `accText`/`mute`/`danger` sobre `bg` e `card`, claro e escuro). Ver `docs/06`.
- Dynamic Type/fonte do Android limitados a 130% (`MAX_FONT_SCALE` em `Text` e nos `TextInput`).
- Check circles (`HabitRow`) com `accessibilityRole="checkbox"`, estado marcado e rótulo "Marcar X como feito".
- Estados de carregamento (skeleton da Hoje), erro de rede (faixa com "Tentar de novo"), vazio e dia sem hábitos.
- Crash reporting com Sentry (`src/lib/monitoring.ts`): desligado sem `EXPO_PUBLIC_SENTRY_DSN`; só erros, sem PII, sem tracing/replay/screenshot. **Não há analytics de produto.**
- Exclusão de conta dentro do app (Perfil → Excluir conta).
- `eas.json` com perfis `development`, `preview` e `production`.

## Pendente · conta e infraestrutura
1. **Sentry**: criar organização/projeto React Native, copiar o DSN público para `EXPO_PUBLIC_SENTRY_DSN` (env do EAS e `.env` local). Para symbolication, adicionar o plugin `@sentry/react-native/expo` ao `app.json` com `organization`/`project` e `SENTRY_AUTH_TOKEN` como segredo do EAS (não commitar).
2. **EAS**: `bunx eas-cli login`, `eas build:configure` (já há `eas.json`), definir variáveis por ambiente com `eas env:create` (`EXPO_PUBLIC_API_URL` de produção, `EXPO_PUBLIC_SENTRY_DSN`). Primeiro build: `eas build -p ios|android --profile production`.
3. **Servidor** (decisão da Fase 0, `docs/11`): Node com `expo-server/adapter/express`, não EAS Hosting (o engine do Prisma não roda em workers). Subir o `Dockerfile` em Railway, Fly.io ou Render; variáveis secretas no host (`DATABASE_URL` com o nome do banco, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `APPLE_*`, `GOOGLE_*`, `EXPO_ACCESS_TOKEN`). O `origin` do plugin `expo-router` vem de `EXPO_PUBLIC_API_URL` (`app.config.ts`, `APP_CONFIG.appOrigin`): defini-la por ambiente no EAS. **Domínios**: o `eas.json` aponta a API para `api.vezzo.cloud` (`api-hml` e `api-dev` nos outros perfis), mas as lojas e as páginas legais usam `vezzo.app`. Decidir qual domínio serve `/privacy` e `/terms` (a mesma instância do servidor serve app e API) e deixar tudo consistente.
4. **Resend**: verificar o domínio de envio (SPF/DKIM) e trocar `EMAIL_FROM` de `onboarding@resend.dev` para um endereço do domínio.
5. **Sign in with Apple**: habilitar a capability no App ID, criar o Services ID e a chave `.p8`, preencher `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` (JWT, expira em até 6 meses: agendar a renovação) e `APPLE_APP_BUNDLE_IDENTIFIER`. `usesAppleSignIn` está `false` nos três perfis de `app.config.ts`: virar `true` junto com esta configuração.
6. **Google**: tela de consentimento OAuth publicada; client IDs de iOS/Android/Web.
7. **Push**: credencial APNs/FCM configurada no projeto EAS (`eas credentials`); `EXPO_ACCESS_TOKEN` no servidor.
8. **Política de privacidade e Termos**: as páginas já existem no app e na web (`/privacy` e `/terms`, textos em `src/i18n/legal/`). Falta: preencher razão social, CNPJ, e-mail de contato e comarca em `src/shared/legal/config.ts` (conferir com `bun scripts/check-legal.ts`, que falha enquanto houver pendência), revisar os textos com assessoria jurídica, publicar o servidor (a URL pública será `https://vezzo.app/privacy`) e informar essa URL nas lojas. Os textos citam "Expo" como hospedagem (`hostingProvider`): ajustar se o host real for Railway/Fly.io/Render (ver `docs/11`). As lojas exigem a URL da política; a Apple também exige o questionário "Privacidade do app" e o Google a seção "Segurança dos dados" (ver tabela abaixo).
9. **Ícones e splash**: o splash já usa a marca (`#BADC4E` no claro, `#000000` no escuro, em `app.config.ts`). Falta trocar o fundo do ícone adaptativo do Android, ainda `#E6F4FE` do template (`android.adaptiveIcon.backgroundColor`, nos três perfis), pela arte de `docs/06` antes do build de produção.
10. **Textos e imagens das lojas**: textos em `docs/loja/pt-BR.md` e `docs/loja/en.md` (rascunhos). Google Play (pronto, 9:16, 1080 × 1920): banners `docs/loja/feature-graphic-{pt-BR,en}.png` (1024 × 500) e 6 capturas por idioma em `docs/loja/screenshots/{pt-BR,en}/`, geradas do app real no emulador Android com o usuário de demonstração (`scripts/store-demo.ts`; procedimento em "Como refazer as capturas" abaixo). Pendente: tablet 7"/10" (opcional no Play) e iOS: o app tem `supportsTablet: false`, então só iPhone (6,9" e 6,5"); iPad 13" só se `supportsTablet` for ligado. As capturas de `screenshots/` são do design, não servem para a loja.
11. **Google Play Console**: criar o app (pt-BR padrão, en-US adicional) e preencher Acesso ao app (o app exige login: informar o usuário de demonstração, com e-mail verificado, para a revisão), Segurança dos dados (tabela abaixo), classificação de conteúdo, público-alvo e anúncios (nenhum). O `eas submit` precisa de uma conta de serviço do Google e de um primeiro envio manual do `.aab`; o `eas.json` envia para a faixa `internal`.

## Como refazer as capturas (Android)
1. Servidor local no ar (`bunx expo start --dev-client`), emulador aberto e `adb reverse tcp:8081 tcp:8081`.
2. `DEMO_PASSWORD=<senha> bun --env-file=.env scripts/store-demo.ts seed pt-BR|en` recria o usuário de demonstração (5 hábitos, sequência de 12 dias, hoje 3/5). O seed precisa ser refeito no dia da captura e ao trocar de idioma (os nomes dos hábitos são gravados no idioma). `... cleanup` remove tudo.
3. Entrar no app com o e-mail de demonstração, escolher o idioma em Perfil → Idioma e desligar o "Tools button" do menu do dev client (senão a engrenagem aparece nas capturas).
4. Barra de status limpa: `adb shell settings put global sysui_demo_allowed 1` e broadcasts `com.android.systemui.demo` (`clock hhmm 0941`, `battery level 100`, `network wifi show level 4 fully true`, `mobile hide`, `notifications visible false`).
5. Abrir cada tela por deep link (`vezzo-development://home|habits|theme|streak`) e capturar com `adb exec-out screencap -p`. O emulador tem 1280 × 2856 (proporção acima de 2:1, fora do limite do Play), por isso as imagens finais são compostas em 1080 × 1920 com legenda e moldura.
6. O percentual de Progresso (semana e mês) conta os dias futuros no denominador (ex.: 66% e "-34% vs semana passada" numa sexta com tudo feito); por isso a tela Progresso ficou fora das capturas.

## Questionários de privacidade das lojas (rascunho de respostas)
| Dado | Coleta | Vinculado ao usuário | Finalidade |
|---|---|---|---|
| E-mail e nome | Sim | Sim | Conta e comunicação (recuperação de senha) |
| Hábitos e registros diários | Sim | Sim | Funcionalidade do app |
| Token de push | Sim | Sim | Lembretes |
| Fuso horário e idioma | Sim | Sim | Datas locais e textos |
| Diagnóstico de falhas (Sentry) | Sim, sem PII | Não | Estabilidade |
| Rastreamento entre apps / publicidade | Não | n/a | n/a |

## Checklist de teste manual antes de publicar
- `/privacy` e `/terms` abrem sem login na web, em pt-BR e en; links em boas-vindas, Criar conta, Entrar e Perfil → Sobre.
- Development build em iPhone, iPad e emulador de dobrável (Pixel Fold): modo dual, rotação sem perder seleção.
- VoiceOver/TalkBack nos check circles e na tab bar; Dynamic Type em 130%.
- Notificações: ações Concluir/Adiar/Pular com o app aberto, em segundo plano e fechado; 4º adiamento recusado.
- Fluxos: cadastro, login por e-mail, Apple, Google, recuperação de senha, exclusão de conta.
