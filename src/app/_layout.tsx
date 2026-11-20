import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Roboto_500Medium } from "@expo-google-fonts/roboto";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { authClient } from "@/auth/client";
import { resolveGate, resolveProfileStatus, SPLASH_MAX_MS, shouldHideSplash } from "@/auth/guard";
import { useInitialSessionPending } from "@/auth/useInitialSessionPending";
import { AppShellSkeleton, Button, Text, ToastHost } from "@/components/ui";
import { clearHabitData } from "@/features/habits/hydrate";
import { useHabitsSync } from "@/features/habits/useHabitsSync";
import { useNotificationRuntime } from "@/features/habits/useNotificationRuntime";
import { useT } from "@/i18n/useT";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { initMonitoring, withMonitoring } from "@/lib/monitoring";
import { cancelAllReminders } from "@/lib/notifications/reschedule";
import { useTheme } from "@/lib/useTheme";
import { useProfileStore } from "@/store/profile";

SplashScreen.preventAutoHideAsync().catch(() => {});
initMonitoring();

function RootLayout() {
  const t = useT();
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

  const { data: session, isPending: sessionRefetching } = authClient.useSession();
  const isPending = useInitialSessionPending(sessionRefetching);
  const userId = session?.user.id;
  const rawProfileStatus = useProfileStore((s) => s.status);
  const hasProfile = useProfileStore((s) => s.profile !== null);
  const ownerId = useProfileStore((s) => s.ownerId);
  const profileStatus = resolveProfileStatus({ status: rawProfileStatus, hasProfile, ownerId, userId });
  const onboardingDone = useProfileStore((s) => s.profile?.onboardingDone ?? false);
  const loadProfile = useProfileStore((s) => s.load);
  const clearProfile = useProfileStore((s) => s.clear);

  // Perfil do servidor decide entre onboarding e abas; troca de usuário recarrega, logout limpa.
  useEffect(() => {
    if (isPending) return;
    if (userId) void loadProfile(userId);
    else {
      clearProfile();
      clearHabitData();
      void cancelAllReminders();
    }
  }, [isPending, userId, loadProfile, clearProfile]);

  // Termos e Privacidade são públicos: abrem sem esperar sessão/perfil (visitante na web, lojas).
  const isLegalRoute = useSegments()[0] === "(legal)";
  const gate = resolveGate({ sessionPending: isPending, hasSession: !!userId, profileStatus, onboardingDone });
  const timezone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  useHabitsSync(gate === "tabs", timezone);
  useNotificationRuntime(gate === "tabs");

  // A splash nativa fica até fontes, sessão e perfil resolverem o gate (sem tela de loading no meio).
  // O limite evita prender o usuário sem rede: depois dele cai no skeleton/erro de sempre.
  const [splashTimedOut, setSplashTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSplashTimedOut(true), SPLASH_MAX_MS);
    return () => clearTimeout(id);
  }, []);
  const hideSplash = shouldHideSplash({ fontsReady, gate, isPublicRoute: isLegalRoute, timedOut: splashTimedOut });
  useEffect(() => {
    if (hideSplash) SplashScreen.hideAsync().catch(() => {});
  }, [hideSplash]);

  if (!fontsReady) return null;
  if (gate === "loading" && !isLegalRoute) {
    return (
      <>
        <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
        <AppShellSkeleton />
      </>
    );
  }

  return (
    <KeyboardProvider>
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      {gate === "error" && !isLegalRoute ? (
        <View style={[styles.error, { backgroundColor: theme.bg }]}>
          <Text tone="mute">{t("common.loadError")}</Text>
          <Button label={t("common.retry")} onPress={() => userId && void loadProfile(userId)} />
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
            <Stack.Screen name="(settings)" />
          </Stack.Protected>
          {/* Recuperação de senha é acessível com ou sem sessão (Perfil → Redefinir senha e deep link). */}
          <Stack.Screen name="(recovery)" />
          {/* Termos de Uso e Política de Privacidade: públicos, links no cadastro e no Perfil. */}
          <Stack.Screen name="(legal)" />
        </Stack>
      )}
      <ToastHost />
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 28 },
});

export default withMonitoring(RootLayout);
