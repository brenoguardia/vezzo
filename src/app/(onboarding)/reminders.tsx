import { useState } from "react";
import { Button } from "@/components/ui";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { currentLocale } from "@/features/onboarding/locale";
import { useT } from "@/i18n/useT";
import { requestReminderPermission } from "@/lib/notifications/permission";
import { useOnboardingStore } from "@/store/onboarding";
import { useProfileStore } from "@/store/profile";

/**
 * Fim do onboarding: texto próprio antes do prompt do sistema (docs/07).
 * O perfil só é marcado como concluído aqui, para a guarda de rotas não pular esta tela.
 */
export default function OnboardingReminders() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const markDone = useProfileStore((s) => s.markOnboardingDone);

  function finish() {
    const name = useOnboardingStore.getState().displayName;
    useOnboardingStore.getState().reset();
    // O perfil nasce em pt-BR; grava o idioma que o usuário viu no onboarding (melhor esforço).
    void useProfileStore.getState().update({ language: currentLocale() }).catch(() => {});
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
