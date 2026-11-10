import { prisma } from "@/server/db";
import { setSessionResolver } from "@/server/http";
import type { FakeDb } from "./fake-db";

/** Em testes, `@/server/db` é substituído por um FakeDb via vi.mock. */
export const db = prisma as unknown as FakeDb;

/**
 * Sessão simulada: o usuário vem do cabeçalho `x-test-user`; sem ele, não há sessão.
 * `x-test-session-age-min` define há quantos minutos o login aconteceu (padrão: agora).
 */
export function installFakeSession(): void {
  setSessionResolver(async (headers) => {
    const userId = headers.get("x-test-user");
    if (!userId) return null;
    const ageMin = Number(headers.get("x-test-session-age-min") ?? 0);
    return { userId, authenticatedAt: new Date(Date.now() - ageMin * 60_000) };
  });
}

export function req(
  url: string,
  options: { user?: string; method?: string; body?: unknown; sessionAgeMin?: number } = {},
): Request {
  const headers = new Headers();
  if (options.user) headers.set("x-test-user", options.user);
  if (options.sessionAgeMin !== undefined) headers.set("x-test-session-age-min", String(options.sessionAgeMin));
  if (options.body !== undefined) headers.set("content-type", "application/json");
  return new Request(`http://localhost${url}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

export const USER_A = "user-a";
export const USER_B = "user-b";

export async function seedHabit(userId: string, overrides: Record<string, unknown> = {}) {
  return db.habit.create({
    data: {
      userId,
      name: "Beber água",
      emoji: "💧",
      goalValue: 2.5,
      goalUnit: "LITERS",
      days: [0, 1, 2, 3, 4, 5, 6],
      ...overrides,
    },
  });
}

export async function seedProfile(userId: string, overrides: Record<string, unknown> = {}) {
  return db.profile.create({ data: { userId, displayName: userId, ...overrides } });
}
