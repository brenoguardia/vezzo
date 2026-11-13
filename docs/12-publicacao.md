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
3. **Servidor** (decisão da Fase 0, `docs/11`): Node com `expo-server/adapter/express`, não EAS Hosting (o engine do Prisma não roda em workers). Subir o `Dockerfile` em Railway, Fly.io ou Render; variáveis secretas no host (`DATABASE_URL` com o nome do banco, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `APPLE_*`, `GOOGLE_*`, `EXPO_ACCESS_TOKEN`). Ajustar o `origin` do plugin `expo-router` em `app.json` para a URL pública.
4. **Resend**: verificar o domínio de envio (SPF/DKIM) e trocar `EMAIL_FROM` de `onboarding@resend.dev` para um endereço do domínio.
5. **Sign in with Apple**: habilitar a capability no App ID, criar o Services ID e a chave `.p8`, preencher `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` (JWT, expira em até 6 meses: agendar a renovação) e `APPLE_APP_BUNDLE_IDENTIFIER`. `usesAppleSignIn` já está em `app.json`.
6. **Google**: tela de consentimento OAuth publicada; client IDs de iOS/Android/Web.
7. **Push**: credencial APNs/FCM configurada no projeto EAS (`eas credentials`); `EXPO_ACCESS_TOKEN` no servidor.
8. **Política de privacidade e Termos**: as páginas já existem no app e na web (`/privacy` e `/terms`, textos em `src/i18n/legal/`). Falta: preencher razão social, CNPJ, e-mail de contato e comarca em `src/shared/legal/config.ts` (conferir com `bun scripts/check-legal.ts`, que falha enquanto houver pendência), revisar os textos com assessoria jurídica, publicar o servidor (a URL pública será `https://vezzo.app/privacy`) e informar essa URL nas lojas. Os textos citam "Expo" como hospedagem (`hostingProvider`): ajustar se o host real for Railway/Fly.io/Render (ver `docs/11`). As lojas exigem a URL da política; a Apple também exige o questionário "Privacidade do app" e o Google a seção "Segurança dos dados" (ver tabela abaixo).
9. **Ícones e splash**: o `app.json` ainda usa o splash `#208AEF` do template e o fundo adaptativo `#E6F4FE` do Android. Trocar pela arte de `docs/06` (fundo `bg`, marca Vezzo) antes do build de produção.
10. **Textos das lojas**: `docs/loja/pt-BR.md` e `docs/loja/en.md` (rascunhos). Capturas: usar `screenshots/` como base e refazer em 6,9" e 6,5" (iPhone) e iPad 13" (o app declara `supportsTablet`).

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
