import { authClient } from "@/auth/client";
import { Button } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { useProfileStore } from "@/store/profile";

export function SignOutButton() {
  const t = useT();
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
