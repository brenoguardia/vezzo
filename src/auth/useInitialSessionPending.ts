import { useState } from "react";

/**
 * `isPending` do Better Auth volta a `true` a cada nova busca da sessão quando não há usuário
 * logado (ex.: ao voltar do Safari por um deep link). Se o layout raiz tratasse isso como
 * "carregando", desmontaria a navegação e o deep link seria perdido. Só a primeira resolução conta.
 */
export function useInitialSessionPending(isPending: boolean): boolean {
  const [resolved, setResolved] = useState(!isPending);
  // Ajuste de estado durante a renderização (padrão recomendado pelo React): sem efeito extra.
  if (!isPending && !resolved) setResolved(true);
  return isPending && !resolved;
}
