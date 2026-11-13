export type AuthErrorKey =
  | "invalidCredentials"
  | "emailNotVerified"
  | "emailTaken"
  | "tooManyRequests"
  | "invalidToken"
  | "network"
  | "server"
  | "social"
  | "generic";

export interface AuthErrorLike {
  code?: string;
  status?: number;
  message?: string;
}

/** Converte o erro do Better Auth numa chave de `auth.errors.*` (sem vazar texto do servidor). */
export function authErrorKey(error: AuthErrorLike | null | undefined): AuthErrorKey {
  if (!error) return "generic";
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_PASSWORD":
      return "invalidCredentials";
    case "EMAIL_NOT_VERIFIED":
      return "emailNotVerified";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "emailTaken";
    case "INVALID_TOKEN":
    case "TOKEN_EXPIRED":
      return "invalidToken";
  }
  if (error.status === 429) return "tooManyRequests";
  if (error.status === 403) return "emailNotVerified";
  if (error.status === 0 || error.status === undefined) return "network";
  if (error.status === 502 || error.status === 503 || error.status === 504) return "server";
  return "generic";
}

/**
 * Falha de conexão sem resposta do servidor: `network` (aparelho sem rede) ou `server` (rede ok, servidor inacessível).
 * `isConnected` vem do NetInfo; `null` (desconhecido) é tratado como conectado.
 */
export function refineNetworkKey(key: AuthErrorKey, isConnected: boolean | null): AuthErrorKey {
  return key === "network" && isConnected !== false ? "server" : key;
}

/** Extrai o token de `vezzo://reset-password?token=...` ou de um parâmetro de rota (pode vir como array). */
export function readToken(param: string | string[] | undefined): string | null {
  const value = Array.isArray(param) ? param[0] : param;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
