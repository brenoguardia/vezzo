# 09 · Estado, formulários e sincronização

## Zustand
Persistência com `persist` + `createJSONStorage(() => mmkvStorage)`. Um store por assunto, sem selector gigante: usar seletores finos (`useStore(s => s.x)`).

```ts
// useThemeStore: persistido
{ accent: Accent; mode: "dark"|"light"|"system"; setAccent(a); setMode(m) }
// derivado: useTheme() resolve tokens (06) a partir de accent + mode + esquema do sistema

// useOnboardingStore: persistido até concluir
{ displayName: string; selected: Record<slug, { goalValue; days: number[] }>;
  toggle(slug); setGoal(slug, v); setDays(slug, d); reset() }

// useHabitsStore: persistido
{ habits: Habit[]; logs: Record<`${habitId}:${date}`, Log>; scheduledIds: Record<habitId, string[]>;
  selectedHabitId?: string;
  hydrate(habits, logs); toggleDone(habitId, date); addValue(habitId, date, delta); skip(habitId, date);
  upsertHabit(h); archiveHabit(id) }

// useSyncStore: persistido
{ queue: LogUpsert[]; lastSyncAt?: string; enqueue(item); flush() }
```
`flush()` roda: ao abrir o app, ao voltar para primeiro plano, ao recuperar rede (`NetInfo`) e a cada gravação (debounce 1 s). Envia `POST /v1/logs/batch`; remove da fila os itens confirmados; reenvio com backoff exponencial (2 s até 60 s). Conflito: vence o `updatedAt` mais recente do servidor para o mesmo `(habitId, date)`.

Hidratação: após login, `GET /v1/profile`, `GET /v1/habits`, `GET /v1/logs?from=<hoje-90d>`. Estatísticas (`lib/stats.ts`) são funções puras sobre o store.

Logout: limpar stores de dados (não o tema), cancelar notificações agendadas, `DELETE /v1/push/register`.

## React Hook Form + Zod
Padrão para todo formulário:
```tsx
const form = useForm<SignUpInput>({ resolver: zodResolver(signUpInput), mode: "onChange" });
<Controller control={form.control} name="email" render={({ field, fieldState }) => (
  <Field label={t("auth.email")} value={field.value} onChangeText={field.onChange}
         onBlur={field.onBlur} error={fieldState.error?.message} />
)} />
```
Componentes `Field`, `PasswordField`, `EmojiField`, `DayPills`, `Stepper` aceitam `error` e `onChangeText`/`onChange` e funcionam com `Controller`. Mensagens de erro do Zod vêm de chaves i18n (`z.setErrorMap` ou mensagens por regra).

Formulários e seus schemas (`src/shared`):
| Tela | Schema |
|---|---|
| Criar conta / Login | `signUpInput` / `signInInput` |
| Esqueci minha senha | `{ email }` |
| Nova senha | `resetPasswordInput` |
| Onboarding nome | `{ displayName }` (`onboardingComplete.shape.displayName`) |
| Onboarding metas | `onboardingComplete.shape.habits` via `useFieldArray` |
| Criar/editar hábito | `habitInput` |
| Perfil | `profileUpdate` |

Regras: botão primário desabilitado enquanto `!formState.isValid || isSubmitting`; foco no primeiro campo inválido; teclado adequado (`email-address`, `textContentType`, `autoComplete`); erros de servidor mapeados com `setError`.

## i18n
`pt-BR` (padrão) e `en`. Idioma inicial por `expo-localization`; usuário pode alterar em Perfil. Chaves agrupadas por tela (`auth.*`, `onboarding.*`, `home.*`, `notif.*`). Textos do design estão em `design/Vezzo Habit App.dc.html` (objeto `t` na classe lógica), usar como fonte.

## Testes recomendados
- `lib/streak.ts`: sequência com dias sem agendamento, hábito criado no meio, `SKIPPED`, virada de fuso.
- `lib/stats.ts`: conclusão semanal, melhor dia, variação vs semana anterior.
- `notifications/schedule.ts`: conversão de dias e gatilhos.
- Schemas Zod: `isSingleEmoji`, `passwordRule`, `hhmm`.
- Rotas de API: autorização (usuário A não acessa dados de B), idempotência de `/logs`, `onboarding/complete` transacional.
