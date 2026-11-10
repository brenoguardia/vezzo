# 03 · API Routes (Expo Router) e schemas Zod

Base: `/api`. Cada rota é um arquivo `+api.ts` em `src/app/api/` (ver `docs/01-arquitetura.md`). Rotas de auth ficam em `/api/auth/*` (Better Auth). Demais rotas em `/api/v1/*` exigem sessão (`withSession`), validam entrada com Zod (`body(schema)` e `query(schema)` de `src/server/http.ts`) e devolvem JSON via `json()`.

Erro padrão: `{ "error": { "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "RATE_LIMITED", "message": string, "fields"?: Record<string,string> } }`.

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/catalog` | categorias e atividades pré-definidas |
| GET | `/v1/profile` | perfil do usuário |
| PUT | `/v1/profile` | atualiza nome, accent, themeMode, language, timezone |
| POST | `/v1/onboarding/complete` | grava nome + hábitos escolhidos com metas e marca `onboardingDone` (transação) |
| GET | `/v1/habits` | hábitos ativos |
| POST | `/v1/habits` | cria hábito |
| PATCH | `/v1/habits/:id` | edita |
| DELETE | `/v1/habits/:id` | arquiva (`?hard=true` exclui) |
| GET | `/v1/logs?from=YYYY-MM-DD&to=YYYY-MM-DD` | logs do período |
| PUT | `/v1/logs` | upsert de log (idempotente por `clientId`) |
| POST | `/v1/logs/batch` | envia fila offline (até 200 itens) |
| GET | `/v1/stats?from=&to=` | completude por dia, sequência atual e recorde, melhor dia |
| POST | `/v1/push/register` | salva token Expo. Corpo `{ token, platform: "ios"\|"android" }` (`pushRegister`); upsert por `token`: se o aparelho trocou de conta, o token passa ao usuário logado |
| DELETE | `/v1/push/register` | remove o token do próprio usuário (logout). Corpo `{ token }` (`pushUnregister`); nunca toca token de outro usuário |
| DELETE | `/v1/account` | exclui conta e dados (exigência das lojas). Exige login há no máx. 10 min (`REAUTH_WINDOW_MINUTES`); senão 403 `REAUTH_REQUIRED` |

Rate limit: 60 req/min por usuário; 10 req/min em `/api/auth/*` por IP. Persistir contadores em MongoDB (o servidor pode não manter estado entre requisições).

## Schemas (em `src/shared/schemas`)
```ts
import { z } from "zod";

export const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const goalUnit = z.enum(["COUNT","LITERS","MILLILITERS","MINUTES","PAGES","BOOLEAN","CURRENCY"]);

export const ACCENTS = ["#b9d94c","#3fbf9f","#4f9cf0","#9a7df0","#ee6f8f","#f08a52","#eab33a"] as const;

export const profileUpdate = z.object({
  displayName: z.string().trim().min(1).max(30).optional(),
  accent: z.enum(ACCENTS).optional(),
  themeMode: z.enum(["DARK","LIGHT","SYSTEM"]).optional(),
  language: z.enum(["pt-BR","en"]).optional(),
  timezone: z.string().optional(),
});

export const habitInput = z.object({
  templateSlug: z.string().optional(),
  name: z.string().trim().min(1).max(40),
  emoji: z.string().min(1).max(16).refine(isSingleEmoji, "Use um único emoji"),
  goalValue: z.number().positive(),
  goalUnit,
  days: z.array(z.number().int().min(0).max(6)).min(1),
  reminders: z.array(hhmm).max(5).default([]),
  quickActions: z.boolean().default(true),
});

export const onboardingComplete = z.object({
  displayName: z.string().trim().min(1).max(30),
  habits: z.array(habitInput).min(1).max(20),
});

export const logUpsert = z.object({
  clientId: z.string().uuid(),
  habitId: z.string(),
  date: ymd,
  value: z.number().min(0).optional(),
  status: z.enum(["PENDING","DONE","SKIPPED"]).optional(),
  source: z.enum(["APP","NOTIFICATION"]).default("APP"),
});
export const logBatch = z.object({ items: z.array(logUpsert).max(200) });

export const signUpInput = z.object({
  email: z.string().email(),
  password: passwordRule,   // ver abaixo
});
export const passwordRule = z.string().min(8).regex(/[A-Za-z]/).regex(/\d/);
export const resetPasswordInput = z.object({ password: passwordRule, confirm: z.string() })
  .refine(v => v.password === v.confirm, { path: ["confirm"], message: "As senhas não coincidem" });
```
`isSingleEmoji`: usar `Intl.Segmenter` (1 grafema) combinado com `/\p{Extended_Pictographic}/u`.

## Lógica de estatísticas (pura, em `src/shared/stats.ts`, com testes)
- `scheduled(habit, date)`: `habit.days` contém o dia da semana de `date` e `date >= createdAt`.
- `dayCompletion(date)`: `feitos / agendados` (ignora `SKIPPED` no denominador). Anel da home: `feitos/agendados` do dia.
- `weekCompletion`: média ponderada por hábitos agendados nos 7 dias (segunda a domingo). Exibida como "78%" com variação vs semana anterior.
- Dia cumprido: `agendados > 0` e todos concluídos. Dia sem hábitos agendados não quebra nem soma.
- `currentStreak`: dias cumpridos consecutivos até hoje. Se hoje ainda não está cumprido, contagem continua a partir de ontem (não zera durante o dia).
- `bestStreak`, `bestDay` (dia da semana com maior média), progresso por hábito (concluídos/agendados na semana), marcos 15, 30 e 100 dias.
