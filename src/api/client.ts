import type { ZodType } from "zod";
import { authClient } from "@/auth/client";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "";

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
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...init,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  if (!response.ok) throw new ApiError(response.status, `HTTP ${response.status}`);
  return schema.parse(await response.json());
}
