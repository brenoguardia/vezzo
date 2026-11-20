export type GateInput = {
  sessionPending: boolean;
  hasSession: boolean;
  profileStatus: "idle" | "loading" | "ready" | "error";
  onboardingDone: boolean;
};

/** Qual grupo de rotas o usuário pode ver (docs/01: auth sem sessão; onboarding; tabs). */
export type Gate = "loading" | "error" | "auth" | "onboarding" | "tabs";

/**
 * Estado do perfil para o gate. Um perfil em cache do mesmo usuário vale como pronto (a revalidação
 * roda em segundo plano); de outro usuário, nunca. Sem cache, vale o estado da requisição.
 */
export function resolveProfileStatus(input: {
  status: GateInput["profileStatus"];
  hasProfile: boolean;
  ownerId: string | null;
  userId: string | undefined;
}): GateInput["profileStatus"] {
  const { status, hasProfile, ownerId, userId } = input;
  if (hasProfile && userId !== undefined && ownerId === userId) return "ready";
  return status === "ready" ? "loading" : status;
}

/** Tempo máximo com a splash na tela esperando sessão e perfil (sem rede, cai no skeleton/erro). */
export const SPLASH_MAX_MS = 4000;

/** A splash nativa só sai com fontes prontas e o gate resolvido; o limite de tempo e as rotas públicas liberam antes. */
export function shouldHideSplash(input: {
  fontsReady: boolean;
  gate: Gate;
  isPublicRoute: boolean;
  timedOut: boolean;
}): boolean {
  if (!input.fontsReady) return false;
  return input.gate !== "loading" || input.isPublicRoute || input.timedOut;
}

export function resolveGate({ sessionPending, hasSession, profileStatus, onboardingDone }: GateInput): Gate {
  if (sessionPending) return "loading";
  if (!hasSession) return "auth";
  if (profileStatus === "error") return "error";
  if (profileStatus !== "ready") return "loading";
  return onboardingDone ? "tabs" : "onboarding";
}
