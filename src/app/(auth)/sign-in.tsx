import { AuthScreen } from "@/features/auth/AuthScreen";
import { CredentialsForm } from "@/features/auth/CredentialsForm";
import { useT } from "@/i18n/useT";

export default function SignIn() {
  const t = useT();
  return (
    <AuthScreen title={t("auth.signInTitle")} back>
      <CredentialsForm mode="sign-in" />
    </AuthScreen>
  );
}
