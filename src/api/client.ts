import type { ZodType } from "zod";
import { authClient } from "@/auth/client";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "";

/** Sem limite, uma requisição pendurada trava a fila de sincronização para sempre. */
export const REQUEST_TIMEOUT_MS = 20000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Chama a API com o cookie de sessão do Better Auth e valida a resposta com o schema compartilhado. */
export async function apiFetch<T>(path: string, schema: ZodType<T>, init: RequestInit = {}): Promise<T> {
  const cookie = await authClient.getCookie();
  // `AbortSignal.timeout` não existe em todo runtime do React Native: controlador manual.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new ApiError(response.status, `HTTP ${response.status}`);
  return schema.parse(await response.json());
}
