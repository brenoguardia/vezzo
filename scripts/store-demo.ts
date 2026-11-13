// Usuário de demonstração para as capturas das lojas (docs/12). Cadastra pela API real do Better Auth (servidor local no ar).
// Uso (servidor local no ar em BETTER_AUTH_URL):
//   DEMO_PASSWORD=... bun --env-file=.env scripts/store-demo.ts seed pt-BR|en [DARK|LIGHT]
//   bun --env-file=.env scripts/store-demo.ts cleanup
// `seed` é idempotente: cria o usuário se faltar, marca o e-mail como verificado, recria os hábitos
// e o histórico (sequência de 12 dias, hoje 3/5) no idioma pedido.
import { prisma } from "@/server/db";
import { addDays, localDate } from "@/shared/dates";

// delivered+...@resend.dev é o endereço de teste do Resend: nunca chega a uma caixa real.
const EMAIL = process.env.DEMO_EMAIL ?? "delivered+vezzo-store-demo@resend.dev";
const NAME = "Ana";
const TIMEZONE = "America/Sao_Paulo";
const base = process.env.BETTER_AUTH_URL ?? "http://localhost:8081";

type Lang = "pt-BR" | "en";
type Seed = {
  pt: string;
  en: string;
  emoji: string;
  goal: number;
  unit: "LITERS" | "MINUTES" | "PAGES" | "BOOLEAN";
  reminders: string[];
  /** Valor/horário de hoje; `null` = pendente. */
  today: { value: number; at: string } | { value: number; at: null };
};

const HABITS: Seed[] = [
  {
    pt: "Beber água",
    en: "Drink water",
    emoji: "💧",
    goal: 2.5,
    unit: "LITERS",
    reminders: ["09:00", "14:00"],
    today: { value: 1.8, at: null },
  },
  {
    pt: "Meditar",
    en: "Meditate",
    emoji: "🧘",
    goal: 10,
    unit: "MINUTES",
    reminders: ["07:30"],
    today: { value: 10, at: "07:30" },
  },
  {
    pt: "Treinar",
    en: "Work out",
    emoji: "🏋️",
    goal: 30,
    unit: "MINUTES",
    reminders: ["12:00"],
    today: { value: 30, at: "12:10" },
  },
  { pt: "Ler", en: "Read", emoji: "📚", goal: 15, unit: "PAGES", reminders: ["21:00"], today: { value: 8, at: null } },
  {
    pt: "Registrar gastos",
    en: "Track expenses",
    emoji: "💰",
    goal: 1,
    unit: "BOOLEAN",
    reminders: ["20:00"],
    today: { value: 1, at: "09:05" },
  },
];

function requirePassword(): string {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 8) throw new Error("Defina DEMO_PASSWORD (mín. 8 caracteres).");
  return password;
}

async function call(path: string, body: unknown) {
  return fetch(`${base}/api/auth${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base, "accept-language": "pt-BR" },
    body: JSON.stringify(body),
    redirect: "manual",
  });
}

async function ensureUser(): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) return existing.id;
  const res = await call("/sign-up/email", { email: EMAIL, password: requirePassword(), name: NAME });
  if (!res.ok) throw new Error(`sign-up falhou: ${res.status}`);
  return (await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } })).id;
}

async function resetData(userId: string) {
  const habits = await prisma.habit.findMany({ where: { userId }, select: { id: true } });
  const ids = habits.map((h) => h.id);
  await prisma.habitLog.deleteMany({ where: { habitId: { in: ids } } });
  await prisma.habit.deleteMany({ where: { id: { in: ids } } });
}

async function seed(lang: Lang, themeMode: "DARK" | "LIGHT") {
  const userId = await ensureUser();
  // E-mail de teste: dispensa o fluxo de verificação (o e-mail nunca seria lido).
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: true, name: NAME } });
  await prisma.profile.upsert({
    where: { userId },
    update: { displayName: NAME, language: lang, themeMode, timezone: TIMEZONE, onboardingDone: true },
    create: { userId, displayName: NAME, language: lang, themeMode, timezone: TIMEZONE, onboardingDone: true },
  });
  await resetData(userId);

  const today = localDate(new Date(), TIMEZONE);
  const created = new Date(`${addDays(today, -40)}T12:00:00-03:00`);
  for (const [order, h] of HABITS.entries()) {
    const habit = await prisma.habit.create({
      data: {
        userId,
        name: lang === "en" ? h.en : h.pt,
        emoji: h.emoji,
        goalValue: h.goal,
        goalUnit: h.unit,
        days: [0, 1, 2, 3, 4, 5, 6],
        reminders: h.reminders,
        order,
        createdAt: created,
      },
    });
    const logs = [];
    // Sequência de 12 dias (ontem até 12 dias atrás) e histórico de 4 semanas com algumas falhas.
    for (let back = 1; back <= 35; back++) {
      const miss = back > 12 && (back === 13 || (back + order * 3) % 7 === 0);
      if (miss) continue;
      const date = addDays(today, -back);
      logs.push({
        habitId: habit.id,
        userId,
        date,
        value: h.goal,
        status: "DONE" as const,
        completedAt: new Date(`${date}T12:00:00-03:00`),
      });
    }
    const done = h.today.value >= h.goal;
    logs.push({
      habitId: habit.id,
      userId,
      date: today,
      value: h.today.value,
      status: done ? ("DONE" as const) : ("PENDING" as const),
      completedAt: h.today.at ? new Date(`${today}T${h.today.at}:00-03:00`) : null,
    });
    await prisma.habitLog.createMany({ data: logs });
  }
  console.log(`Seed ok: ${EMAIL} (${lang}, ${themeMode}), ${HABITS.length} hábitos, hoje ${today}.`);
}

async function cleanup() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) return console.log("Nada a remover.");
  await resetData(user.id);
  await prisma.pushToken.deleteMany({ where: { userId: user.id } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });
  await prisma.profile.deleteMany({ where: { userId: user.id } });
  await prisma.user.deleteMany({ where: { id: user.id } });
  await prisma.verification.deleteMany({ where: { identifier: { contains: EMAIL } } });
  console.log("Usuário de demonstração removido.");
}

const [command, lang = "pt-BR", mode = "DARK"] = process.argv.slice(2);
try {
  if (command === "seed" && (lang === "pt-BR" || lang === "en") && (mode === "DARK" || mode === "LIGHT")) {
    await seed(lang, mode);
  } else if (command === "cleanup") await cleanup();
  else throw new Error("Uso: store-demo.ts seed <pt-BR|en> [DARK|LIGHT] | cleanup");
} catch (error) {
  process.exitCode = 1;
  console.error(error);
} finally {
  await prisma.$disconnect();
}
