import { Button } from "@/components/ui";
import { authClient } from "@/auth/client";
import { t } from "@/i18n";
import { useProfileStore } from "@/store/profile";

export function SignOutButton() {
  const clear = useProfileStore((s) => s.clear);
  return (
    <Button
      label={t("common.signOut")}
      variant="secondary"
      onPress={async () => {
        await authClient.signOut();
        clear();
      }}
    />
  );
}
