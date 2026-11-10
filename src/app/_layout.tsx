import { Roboto_500Medium } from "@expo-google-fonts/roboto";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { authClient } from "@/auth/client";
import { resolveGate } from "@/auth/guard";
import { Button, Text, ToastHost } from "@/components/ui";
import { clearHabitData } from "@/features/habits/hydrate";
import { useNotificationRuntime } from "@/features/habits/useNotificationRuntime";
import { useHabitsSync } from "@/features/habits/useHabitsSync";
import { t } from "@/i18n";
import { cancelAllReminders } from "@/lib/notifications/reschedule";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { initMonitoring, withMonitoring } from "@/lib/monitoring";
import { useTheme } from "@/lib/useTheme";
import { useProfileStore } from "@/store/profile";

SplashScreen.preventAutoHideAsync().catch(() => {});
initMonitoring();

function RootLayout() {
  const theme = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Roboto_500Medium,
  });
  const fontsReady = fontsLoaded || !!fontError;

  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const profileStatus = useProfileStore((s) => s.status);
  const onboardingDone = useProfileStore((s) => s.profile?.onboardingDone ?? false);
  const loadProfile = useProfileStore((s) => s.load);
  const clearProfile = useProfileStore((s) => s.clear);

  // Perfil do servidor decide entre onboarding e abas; troca de usuário recarrega, logout limpa.
  useEffect(() => {
    if (isPending) return;
    if (userId) void loadProfile();
    else {
      clearProfile();
      clearHabitData();
      void cancelAllReminders();
    }
  }, [isPending, userId, loadProfile, clearProfile]);

  const gate = resolveGate({ sessionPending: isPending, hasSession: !!userId, profileStatus, onboardingDone });
  const timezone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  useHabitsSync(gate === "tabs", timezone);
  useNotificationRuntime(gate === "tabs");
  const ready = fontsReady && gate !== "loading";

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      {gate === "error" ? (
        <View style={[styles.error, { backgroundColor: theme.bg }]}>
          <Text tone="mute">{t("common.loadError")}</Text>
          <Button label={t("common.retry")} onPress={() => void loadProfile()} />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
          <Stack.Protected guard={gate === "auth"}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={gate === "onboarding"}>
            <Stack.Screen name="(onboarding)" />
          </Stack.Protected>
          <Stack.Protected guard={gate === "tabs"}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="habit" />
            <Stack.Screen name="streak" />
          </Stack.Protected>
          {/* Recuperação de senha é acessível com ou sem sessão (Perfil → Redefinir senha e deep link). */}
          <Stack.Screen name="(recovery)" />
        </Stack>
      )}
      <ToastHost />
    </>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 28 },
});

export default withMonitoring(RootLayout);
