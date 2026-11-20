import { Redirect } from "expo-router";
import { resolveGate } from "@/auth/guard";
import { useGateInputs } from "@/auth/useGateInputs";

/**
 * Entrada "/": cada grupo protegido só existe para o seu estado (auth, onboarding, abas),
 * então a raiz precisa existir sempre e encaminhar para a primeira tela do grupo liberado.
 */
export default function Index() {
  const gate = resolveGate(useGateInputs().input);

  if (gate === "auth") return <Redirect href="/welcome" />;
  if (gate === "onboarding") return <Redirect href="/name" />;
  if (gate === "tabs") return <Redirect href="/home" />;
  return null;
}
