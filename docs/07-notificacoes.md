# 07 · Notificações e ações rápidas (`expo-notifications`)

Consulte a documentação atual do Expo Notifications (SDK em uso). Notificações exigem development build (`expo-dev-client`) para push remoto e para os testes completos de ações.

## Estratégia
- **Lembretes locais** agendados no aparelho (funcionam offline). Fonte: `Habit.reminders` e `Habit.days`.
- **Push remoto** (Expo Push) só para casos futuros (resumo semanal, reengajamento). Token enviado a `POST /v1/push/register`.

## Permissão
Pedir no fim do onboarding (após a tela de metas), com texto próprio antes do prompt do sistema: "Quer receber lembretes dos seus hábitos?". Se negado, mostrar em Perfil → Lembretes um aviso com atalho para os Ajustes. Android 13+: criar canal `habits` (`importance: DEFAULT`) antes de pedir.

## Categoria e ações
```ts
await Notifications.setNotificationCategoryAsync("HABIT_REMINDER", [
  { identifier: "COMPLETE", buttonTitle: t("notif.complete"), options: { opensAppToForeground: false } },
  { identifier: "SNOOZE_1H", buttonTitle: t("notif.snooze"),  options: { opensAppToForeground: false } },
  { identifier: "SKIP",      buttonTitle: t("notif.skip"),    options: { opensAppToForeground: false, isDestructive: false } },
]);
```
Registrar a categoria ao iniciar o app e sempre que o idioma mudar. Títulos: Concluir / Adiar 1h / Pular (en: Done / Snooze 1h / Skip).

## Agendamento
Para cada hábito ativo e cada horário em `reminders`, para cada dia em `days`, agendar um gatilho semanal (`SchedulableTriggerInputTypes.WEEKLY`, `weekday` 1=domingo ... 7=sábado no Expo; converter do nosso 0=segunda). Conteúdo:
```ts
{ title: t("notif.title", { habit: habit.name }),      // "Hora de ler"
  body:  motivationalBody(habit, profile),               // "Ana, 15 páginas hoje mantêm sua sequência de 12 dias."
  categoryIdentifier: "HABIT_REMINDER",
  data: { habitId, date: "YYYY-MM-DD" }, sound: "default" }
```
Guardar os identificadores retornados em `useHabitsStore.scheduledIds[habitId]` para cancelar e reagendar quando o hábito ou o fuso mudar. Função `rescheduleAll()` roda: após login, ao editar hábitos, ao mudar fuso/idioma e ao abrir o app (reconciliação). iOS limita 64 notificações locais pendentes; com gatilhos semanais repetidos isso raramente é um problema, mas priorizar os próximos horários se ultrapassar.

Notificação agregada opcional (segunda, 8h): resumo da semana.

## Tratamento das ações
`Notifications.addNotificationResponseReceivedListener` (app em primeiro plano ou aberto) e `Notifications.registerTaskAsync` com `TaskManager` (execução em segundo plano) chamam um único `handleAction(response)`:
- `COMPLETE`: grava log `DONE` (`value = goalValue`, `source = NOTIFICATION`).
- `SNOOZE_1H`: agenda uma notificação única daqui a 60 min com a mesma categoria. Máximo de 3 adiamentos por dia por hábito.
- `SKIP`: grava log `SKIPPED`.
- Toque no corpo (`DEFAULT_ACTION_IDENTIFIER`): abre `habit/[id]`.
Gravação: no store persistido e na fila de sincronização (`clientId = uuid`). Se não houver rede, sincroniza depois. Idempotência pelo `clientId`.

Depois de `COMPLETE` ou `SKIP`, cancelar notificações pendentes do mesmo hábito para o dia (ex.: segundo lembrete).

## Hábitos com meta numérica
Para água, páginas e minutos, `COMPLETE` completa a meta inteira. Se o usuário quiser registrar parcial, abre o app no detalhe. Avaliar em versão futura ações com campo de texto (`textInput`, iOS).

## Texto das notificações (pt/en)
Título: "Hora de {hábito}" / "Time for {habit}". Corpo conforme situação: mantém sequência, falta pouco para a meta ("Faltam 500 ml para fechar a meta de água."), retomada após dia perdido. Máximo de 1 notificação por hábito e horário; nunca mais de 8 por dia no total.

## Testes
Ferramenta de debug em Perfil (somente dev) que dispara um lembrete em 5 s. Cobrir com testes de unidade: conversão de dias, geração de gatilhos, limite de adiamentos.

## Testado no simulador iOS (iPhone Duo, iOS 27.2)
- **Aberto, segundo plano e encerrado:** Concluir, Adiar 1h (limite de 3 por dia) e Pular funcionam e gravam `source = NOTIFICATION`. Com o app encerrado, a ação chega ao servidor em segundos porque o listener de resposta é registrado no **escopo do módulo** (`useNotificationRuntime.ts`), não depois do login. Validado com um lembrete semanal real, em build **Release**.
- **Dev client:** com o app encerrado o JavaScript não roda (o bundle vem do Metro), então essa ação não dá para testar nele.
- **Rodar o Release no simulador:** compile com assinatura ad hoc (`CODE_SIGN_IDENTITY="-"`); sem ela o `SecureStore` falha ("direito exigido não está presente") e o app mostra "Sem conexão". A API precisa ser o servidor de produção (`bun run build:server` e `node server.js`): o `expo start` recusa o cabeçalho `Origin: vezzo://` (CORS). `EXPO_PUBLIC_API_URL` entra no bundle por `.env.production.local`.
- A tela "Testar lembrete" existe só em `__DEV__`.
