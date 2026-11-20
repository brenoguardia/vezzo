import { authClient } from "@/auth/client";
import { type GateInput, resolveProfileStatus } from "@/auth/guard";
import { useInitialSessionPending } from "@/auth/useInitialSessionPending";
import { useProfileStore } from "@/store/profile";

/**
 * Entradas do gate de rotas (sessão + perfil), numa única fonte: o layout raiz e a rota "/" precisam
 * decidir igual. Se cada um lesse o `status` bruto do perfil, um perfil em cache sem rede (status "idle")
 * deixaria a rota "/" esperando para sempre, com a tela vazia.
 */
export function useGateInputs(): { userId: string | undefined; input: GateInput } {
  const { data: session, isPending: sessionRefetching } = authClient.useSession();
  const sessionPending = useInitialSessionPending(sessionRefetching);
  const userId = session?.user.id;
  const status = useProfileStore((s) => s.status);
  const hasProfile = useProfileStore((s) => s.profile !== null);
  const ownerId = useProfileStore((s) => s.ownerId);
  const onboardingDone = useProfileStore((s) => s.profile?.onboardingDone ?? false);
  const profileStatus = resolveProfileStatus({ status, hasProfile, ownerId, userId });
  return { userId, input: { sessionPending, hasSession: !!userId, profileStatus, onboardingDone } };
}
