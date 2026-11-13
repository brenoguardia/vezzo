import { LegalScreen } from "@/features/legal/LegalScreen";

/** Página pública exigida pelo Google Play: como excluir a conta e os dados (URL: /account-deletion). */
export default function AccountDeletion() {
  return <LegalScreen kind="account-deletion" />;
}
