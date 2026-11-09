import { AuthScreen } from "@/features/auth/AuthScreen";
import { CredentialsForm } from "@/features/auth/CredentialsForm";
import { t } from "@/i18n";

export default function SignIn() {
  return (
    <AuthScreen title={t("auth.signInTitle")} back>
      <CredentialsForm mode="sign-in" />
    </AuthScreen>
  );
}
