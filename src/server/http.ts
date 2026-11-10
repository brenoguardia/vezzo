import { z, type ZodType } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "REAUTH_REQUIRED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  REAUTH_REQUIRED: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  readonly status: number;

  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = STATUS[code];
  }
}

export function json<T>(data: T, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return json(
      { error: { code: error.code, message: error.message, fields: error.fields } },
      { status: error.status },
    );
  }
  console.error("[api] erro inesperado", error);
  return json(
    { error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor." } },
    { status: 500 },
  );
}

function zodFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

function parse<S extends ZodType>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", "Dados inválidos.", zodFields(result.error));
  }
  return result.data;
}

/** Valida o corpo JSON da requisição. Responde 400 se inválido. */
export async function body<S extends ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError("VALIDATION_ERROR", "Corpo JSON inválido.");
  }
  return parse(schema, raw);
}

/** Valida a query string da requisição. Responde 400 se inválida. */
export function query<S extends ZodType>(request: Request, schema: S): z.output<S> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  return parse(schema, params);
}

/** `authenticatedAt`: quando o usuário fez login (início da sessão); base da reautenticação recente. */
export type Session = { userId: string; authenticatedAt?: Date };
export type SessionResolver = (headers: Headers) => Promise<Session | null>;

// Padrão: sessão do Better Auth (cookie/Bearer). Import dinâmico mantém testes sem a instância de auth.
let resolveSession: SessionResolver = async (headers) => {
  const { auth } = await import("./auth");
  const session = await auth.api.getSession({ headers });
  return session ? { userId: session.user.id, authenticatedAt: new Date(session.session.createdAt) } : null;
};

export function setSessionResolver(resolver: SessionResolver): void {
  resolveSession = resolver;
}

export type RouteContext = {
  request: Request;
  params: Record<string, string>;
  userId: string;
  authenticatedAt?: Date;
  body: <S extends ZodType>(schema: S) => Promise<z.output<S>>;
  query: <S extends ZodType>(schema: S) => z.output<S>;
};

type Handler = (ctx: RouteContext) => Response | Promise<Response>;

/**
 * Envolve um handler de rota: exige sessão (401), expõe `userId` da sessão,
 * valida body/query com Zod e padroniza erros (docs/03).
 */
export function withSession(handler: Handler) {
  return async (request: Request, params: Record<string, string> = {}): Promise<Response> => {
    try {
      const session = await resolveSession(request.headers);
      if (!session) throw new ApiError("UNAUTHORIZED", "Sessão ausente ou inválida.");
      return await handler({
        request,
        params,
        userId: session.userId,
        authenticatedAt: session.authenticatedAt,
        body: (schema) => body(request, schema),
        query: (schema) => query(request, schema),
      });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

// TODO (Fase 1): rateLimit com contador persistido em MongoDB (docs/03).
