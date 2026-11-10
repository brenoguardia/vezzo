import { Redirect } from "expo-router";
import { authClient } from "@/auth/client";
import { resolveGate } from "@/auth/guard";
import { useInitialSessionPending } from "@/auth/useInitialSessionPending";
import { useProfileStore } from "@/store/profile";

/**
 * Entrada "/": cada grupo protegido só existe para o seu estado (auth, onboarding, abas),
 * então a raiz precisa existir sempre e encaminhar para a primeira tela do grupo liberado.
 */
export default function Index() {
  const { data: session, isPending: sessionRefetching } = authClient.useSession();
  const isPending = useInitialSessionPending(sessionRefetching);
  const profileStatus = useProfileStore((s) => s.status);
  const onboardingDone = useProfileStore((s) => s.profile?.onboardingDone ?? false);
  const gate = resolveGate({ sessionPending: isPending, hasSession: !!session?.user.id, profileStatus, onboardingDone });

  if (gate === "auth") return <Redirect href="/welcome" />;
  if (gate === "onboarding") return <Redirect href="/name" />;
  if (gate === "tabs") return <Redirect href="/home" />;
  return null;
}
