import { AuthScreen } from "@/features/auth/AuthScreen";
import { CredentialsForm } from "@/features/auth/CredentialsForm";
import { useT } from "@/i18n/useT";

export default function SignUp() {
  const t = useT();
  return (
    <AuthScreen title={t("auth.signUpTitle")} back>
      <CredentialsForm mode="sign-up" />
    </AuthScreen>
  );
}
