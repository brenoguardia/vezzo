# 02 · Modelo de dados (Prisma + MongoDB)

Use Prisma 6.x (`provider = "mongodb"`). MongoDB precisa de replica set (Atlas já fornece). Use `prisma db push`, não migrations.

## Tabelas do Better Auth
Gere com `bunx @better-auth/cli generate` (adapter Prisma, provider `mongodb`) e mescle em `schema.prisma`. Modelos esperados: `User`, `Session`, `Account`, `Verification`. Mantenha `User` com os campos do Better Auth e adicione somente as relações abaixo.

## Schema do domínio
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "mongodb"  url = env("DATABASE_URL") }

model Profile {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  userId         String   @unique
  displayName    String
  accent         String   @default("#b9d94c")   // hex, uma das 7 cores da paleta
  themeMode      ThemeMode @default(SYSTEM)
  language       String   @default("pt-BR")     // "pt-BR" | "en"
  timezone       String   @default("America/Sao_Paulo")
  onboardingDone Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
enum ThemeMode { DARK LIGHT SYSTEM }

model Category {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  slug     String  @unique          // "saude", "mente", "produtividade", "financas"
  namePt   String
  nameEn   String
  order    Int
  templates HabitTemplate[]
}

model HabitTemplate {          // atividades pré-definidas (seed)
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  slug        String   @unique
  categoryId  String   @db.ObjectId
  category    Category @relation(fields: [categoryId], references: [id])
  namePt      String
  nameEn      String
  emoji       String
  defaultGoalValue Float
  goalUnit    GoalUnit
  defaultDays Int[]               // 0=segunda ... 6=domingo
  order       Int
}
enum GoalUnit { COUNT LITERS MILLILITERS MINUTES PAGES BOOLEAN CURRENCY }

model Habit {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String
  templateId String?  @db.ObjectId
  name       String
  emoji      String                      // emoji pré-definido ou do usuário
  goalValue  Float
  goalUnit   GoalUnit
  days       Int[]                       // dias da semana agendados
  reminders  String[]                    // "HH:mm" no fuso do usuário
  quickActions Boolean @default(true)    // mostra ações rápidas na notificação
  order      Int      @default(0)
  archivedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  logs       HabitLog[]
  @@index([userId, archivedAt])
}

model HabitLog {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  habitId   String   @db.ObjectId
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  userId    String
  date      String                       // "YYYY-MM-DD" no fuso do usuário
  value     Float    @default(0)         // progresso acumulado do dia
  status    LogStatus @default(PENDING)
  source    LogSource @default(APP)
  completedAt DateTime?
  clientId  String?                      // idempotência da fila offline
  updatedAt DateTime @updatedAt
  @@unique([habitId, date])
  @@index([userId, date])
}
enum LogStatus { PENDING DONE SKIPPED }
enum LogSource { APP NOTIFICATION }

model PushToken {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String
  token     String   @unique            // ExponentPushToken[...]
  platform  String
  createdAt DateTime @default(now())
  @@index([userId])
}
```

## Regras
- `HabitLog` é único por `(habitId, date)`. Escrita é upsert.
- `status = DONE` quando `value >= goalValue` (ou `BOOLEAN` marcado). `SKIPPED` não quebra a sequência e não conta na meta do dia.
- Arquivar hábito (`archivedAt`) preserva histórico. Exclusão definitiva apaga logs em cascata.
- `userId` em todas as queries vem da sessão, nunca do corpo da requisição.

## Seed (`prisma/seed.ts`)
Categorias e atividades do design:
- **Saúde**: Beber água 💧 (2,5 L), Treinar 🏋️ (30 min), Dormir cedo 😴, Comer bem 🥗
- **Mente**: Meditar 🧘 (10 min), Ler 📚 (15 páginas), Diário ✍️, Estudar idioma 🌍
- **Produtividade**: Foco profundo 🎯, Planejar o dia 🗓️
- **Finanças**: Registrar gastos 💰

Os mesmos itens (slug, emoji, textos pt/en) ficam em `src/shared/categories.ts` para o onboarding funcionar offline. O seed lê desse arquivo.
