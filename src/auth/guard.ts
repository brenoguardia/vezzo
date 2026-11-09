export type GateInput = {
  sessionPending: boolean;
  hasSession: boolean;
  profileStatus: "idle" | "loading" | "ready" | "error";
  onboardingDone: boolean;
};

/** Qual grupo de rotas o usuário pode ver (docs/01: auth sem sessão; onboarding; tabs). */
export type Gate = "loading" | "error" | "auth" | "onboarding" | "tabs";

export function resolveGate({ sessionPending, hasSession, profileStatus, onboardingDone }: GateInput): Gate {
  if (sessionPending) return "loading";
  if (!hasSession) return "auth";
  if (profileStatus === "error") return "error";
  if (profileStatus !== "ready") return "loading";
  return onboardingDone ? "tabs" : "onboarding";
}
