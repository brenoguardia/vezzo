import { useState } from "react";
import { Button } from "@/components/ui";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { t } from "@/i18n";
import { requestReminderPermission } from "@/lib/notifications";
import { useOnboardingStore } from "@/store/onboarding";
import { useProfileStore } from "@/store/profile";

/**
 * Fim do onboarding: texto próprio antes do prompt do sistema (docs/07).
 * O perfil só é marcado como concluído aqui, para a guarda de rotas não pular esta tela.
 */
export default function OnboardingReminders() {
  const [busy, setBusy] = useState(false);
  const markDone = useProfileStore((s) => s.markOnboardingDone);

  function finish() {
    const name = useOnboardingStore.getState().displayName;
    useOnboardingStore.getState().reset();
    markDone(name || undefined);
  }

  async function enable() {
    setBusy(true);
    try {
      await requestReminderPermission();
    } finally {
      finish();
    }
  }

  return (
    <OnboardingShell
      title={t("onboarding.remindersTitle")}
      subtitle={t("onboarding.remindersSub")}
      footer={
        <>
          <Button label={t("onboarding.remindersEnable")} loading={busy} onPress={() => void enable()} />
          <Button label={t("onboarding.remindersSkip")} variant="secondary" disabled={busy} onPress={finish} />
        </>
      }
    />
  );
}
