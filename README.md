# Handoff: Vezzo, app de hábitos personalizável

Pacote para desenvolvimento com Claude Code. Comece por este arquivo e depois leia `CLAUDE.md` e os documentos em `docs/`, na ordem numérica.

## Visão geral
Vezzo (do italiano *vezzo*, "hábito", e "vez": a vez de hoje) é um app de hábitos em que o usuário:
- cria conta (e-mail e senha, Apple, Google) e pode redefinir a senha;
- passa por um onboarding: como quer ser chamado, quais atividades quer melhorar (categorias pré-definidas) e meta de cada uma;
- usa uma home com resumos diário e semanal;
- personaliza a cor de destaque e o modo claro/escuro;
- recebe lembretes e conclui, adia ou pula o hábito direto pela notificação;
- usa um layout de duas colunas em telas largas e dobráveis.

## Sobre os arquivos de design
`design/Vezzo Habit App.dc.html` é uma **referência de design em HTML**: protótipo visual com cores, espaçamentos, textos e fluxos. Não é código de produção. Recrie as telas em React Native (Expo) com os padrões descritos em `docs/`. Abra o arquivo no navegador; ele é um canvas com zoom. O painel Tweaks troca idioma (pt/en), modo (dark/light) e cor de destaque.

## Fidelidade
**Alta (hifi).** Cores, tipografia, raios e espaçamentos são finais. Valores exatos em `docs/06-design-tokens.md` e `docs/05-telas.md`. Exceções: os botões Apple e Google usam aproximações (usar os componentes oficiais de cada marca) e os emojis seguem o conjunto do sistema.

## Capturas de tela (`screenshots/`)
Estado de referência: tema escuro, cor lima, idioma pt-BR. As telas funcionam em claro e com as 7 cores de destaque.

| Arquivo | Tela | Spec |
|---|---|---|
| `01-splash.png` | Splash e boas-vindas | `docs/05-telas.md` §1 |
| `02-criar-conta.png` | Criar conta | §2 |
| `03-redefinir-1-email.png` | Redefinir senha, e-mail | §3.1 |
| `04-redefinir-2-link-enviado.png` | Redefinir senha, link enviado | §3.2 |
| `05-redefinir-3-nova-senha.png` | Redefinir senha, nova senha | §3.3 |
| `06-onboarding-1-nome.png` | Onboarding, nome | §4.1 |
| `07-onboarding-2-atividades.png` | Onboarding, atividades | §4.2 |
| `08-onboarding-3-metas.png` | Onboarding, metas | §4.3 |
| `09-home-diario.png` | Home, resumo diário | §5 |
| `10-home-semanal.png` | Home, resumo semanal | §6 |
| `11-detalhe-habito.png` | Detalhe do hábito | §7 |
| `12-criar-habito.png` | Criar e editar hábito | §8 |
| `13-tema.png` | Personalização de tema | §10 |
| `14-notificacao.png` | Notificação e ações rápidas | `docs/07-notificacoes.md` |
| `15-perfil.png` | Perfil e configurações | §11 |
| `16-sequencia.png` | Sequência e frases | §9 |
| `17-dobravel-home-detalhe.png` | Dobrável, home + detalhe | `docs/08-layout-adaptativo.md` |
| `18-dobravel-onboarding.png` | Dobrável, onboarding | `docs/08-layout-adaptativo.md` |
| `19-icone-1a.png` | Nome e ícone do app | `docs/06-design-tokens.md` |

## Stack
| Camada | Tecnologia |
|---|---|
| App | React Native com Expo (SDK mais recente), Expo Router |
| Formulários | React Hook Form + `@hookform/resolvers` |
| Estado | Zustand (com persistência) |
| Validação | Zod (schemas compartilhados entre app e API) |
| Auth | Better Auth (e-mail/senha, Apple, Google) + `@better-auth/expo` |
| E-mail | Resend |
| ORM | Prisma (versão 6.x, a que suporta MongoDB) |
| Banco | MongoDB (Atlas, com replica set) |
| Notificações | `expo-notifications` |
| Gerenciador de pacotes | Bun (`bun install`, `bunx`, `bun.lock`) |
| Backend | API Routes do Expo Router (`app/api/**/+api.ts`), no mesmo projeto do app |

Projeto único (sem monorepo e sem API externa): o Expo Router serve o app e as rotas de API. Telas e código de cliente nunca importam Prisma, Resend nem MongoDB; só os arquivos `+api.ts` e `src/server/**` fazem isso. Ver `docs/01-arquitetura.md`.

## Observação sobre "iPhone Duo"
Não existe iPhone de duas telas. O design usa o conceito de dobrável de duas telas (2 × 540 pt, dobradiça de 28 pt). No iOS, o layout de duas colunas é ativado por **largura da janela** (`>= 600 pt`): iPad, iPhone em paisagem Max e dobráveis Android. Detalhes em `docs/08-layout-adaptativo.md`.

## Índice
1. `CLAUDE.md`: regras permanentes para o agente
2. `docs/01-arquitetura.md`: projeto Expo full stack, pastas, fluxo de dados
3. `docs/02-modelo-de-dados.md`: schema Prisma (MongoDB)
4. `docs/03-api.md`: API Routes e schemas Zod
5. `docs/04-autenticacao.md`: Better Auth, OAuth, Resend, redefinição de senha
6. `docs/05-telas.md`: especificação de cada tela
7. `docs/06-design-tokens.md`: cores, tipografia, espaçamento
8. `docs/07-notificacoes.md`: lembretes e ações rápidas
9. `docs/08-layout-adaptativo.md`: iPhone, iPad e dobráveis
10. `docs/09-estado-e-formularios.md`: Zustand, React Hook Form, sincronização
11. `docs/10-plano-de-implementacao.md`: fases e prompts prontos para o Claude Code

## Decisões em aberto
- Definição de "dia cumprido" para a sequência (padrão adotado: todos os hábitos agendados do dia concluídos).
- Verificação de e-mail obrigatória antes do primeiro login (padrão adotado: sim).
- Hospedagem do servidor Expo (padrão: EAS Hosting; ver riscos em `docs/01-arquitetura.md`).
- Provedor de push em produção (padrão adotado: Expo Push Service).
- Conferir disponibilidade do nome "Vezzo" nas lojas, no INPI e em domínios.
