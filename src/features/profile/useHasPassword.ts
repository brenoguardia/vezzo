import { useEffect, useState } from "react";
import { authClient } from "@/auth/client";

/** A conta tem senha (provedor "credential")? Contas só Apple/Google não têm (docs/04). `null` = carregando. */
export function useHasPassword(): boolean | null {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    authClient
      .listAccounts()
      .then(({ data }) => {
        if (!cancelled) setHasPassword(!!data?.some((account) => account.providerId === "credential"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return hasPassword;
}
