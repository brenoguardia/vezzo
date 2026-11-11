# E2E (Maestro)

Fluxos que rodam no simulador iOS com o development build (`com.itbuilder.vezzo`).

## Pré-requisitos
- Maestro (`brew tap mobile-dev-inc/tap && brew install mobile-dev-inc/tap/maestro`) e Java.
- Servidor de desenvolvimento no ar (`bunx expo start --dev-client`) e o simulador aberto.
- Sessão iniciada no app (os fluxos de `auth` partem de deslogado e fazem o próprio login).

## Fluxos
| Arquivo | Cobre |
|---|---|
| `tabs.yaml` | as 4 abas |
| `today.yaml` | marcar/desmarcar, detalhe, concluir/desfazer, sequência |
| `habit-lifecycle.yaml` | criar, persistir após reabrir, editar, arquivar, desarquivar |
| `progress.yaml` | semana, mês e ano |
| `profile-language.yaml` | idioma muda no app inteiro sem reabrir |
| `profile-screens.yaml` | Tema, Testar lembrete e Excluir conta abrem |
| `theme.yaml` | trocar cor e modo, aplicar e restaurar |
| `notifications.yaml` | tela de debug agenda um lembrete |
| `dual-layout.yaml` | layout de duas colunas (iPhone em paisagem) |

Não cobertos: cadastro, login, Apple/Google e recuperação de senha (exigem credenciais ou e-mail) e as ações das notificações com o app fechado (só em aparelho real).

## Rodar
```
maestro test e2e/tabs.yaml
maestro test e2e            # todos (os arquivos que começam com _ são auxiliares)
```
As capturas vão para `e2e/.shots/` (ignoradas pelo git).

## Dados de teste
Os fluxos rodam contra a conta logada e o banco de desenvolvimento. `habit-lifecycle.yaml` cria hábitos chamados "E2E ..."; limpe com `bun --env-file=.env scripts/e2e-cleanup.ts`. As capturas ficam em `~/.maestro/tests/<data>/<fluxo>/`.

## Armadilhas conhecidas
- O botão flutuante "Tools" do dev client cobre a ponta direita de "Salvar"; os fluxos tocam em `point: "25%,50%"`.
- Os cartões da lista expõem um único rótulo "Nome. Subtítulo": use `"Nome.*"` nos seletores.
- Abas: use `id: tab-home|tab-progress|tab-habits|tab-profile` (o texto repete em títulos de seção).
- A barra de abas flutuante cobre o fim das listas: use `centerElement: true` em `scrollUntilVisible` antes de tocar.

## Android (emulador)
- Conecte ao Metro com `adb reverse tcp:8081 tcp:8081` e rode com `maestro --device emulator-5554 test ...`.
- `android/notif-permission.yaml` pede a permissão de notificação (Android 13+) e aceita o diálogo.
- `android/notif-actions.yaml -e MODE=foreground|background -e ACTION=Concluir|Pular|Adiar` dispara o lembrete de teste e age pela barra de notificações (no Android o Maestro enxerga a interface do sistema, ao contrário do iOS). **Não** toque no corpo da notificação antes: abre o detalhe do hábito e o próximo "Concluir" cairia no botão do app.
- Com o app **encerrado**: `stopApp` faz *force-stop* e o Android cancela os alarmes agendados; use `adb shell am kill com.itbuilder.vezzo` com o app em segundo plano. No dev client a ação acorda o app mas o JS não carrega (sem Metro), então esse caso só se valida em build Release.
