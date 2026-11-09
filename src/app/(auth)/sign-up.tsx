import { AuthScreen } from "@/features/auth/AuthScreen";
import { CredentialsForm } from "@/features/auth/CredentialsForm";
import { t } from "@/i18n";

export default function SignUp() {
  return (
    <AuthScreen title={t("auth.signUpTitle")} back>
      <CredentialsForm mode="sign-up" />
    </AuthScreen>
  );
}
