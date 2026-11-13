import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/lib/useTheme";

/**
 * Layout raiz da web. A web só expõe a landing (`/`), as páginas legais e a API (`/api/**`, fora do router).
 * O app (login, onboarding, abas, hábitos, ajustes) só roda instalado: seus grupos ficam atrás de um guard
 * fechado, então abrir `/home` ou `/sign-in` cai em `+not-found.tsx`, que volta para a landing.
 * O layout nativo está em `_layout.tsx` e não é carregado aqui.
 */
export default function WebRootLayout() {
  const theme = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  if (!fontsLoaded && !fontError) return null;

  return (
    <>
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(legal)" />
        <Stack.Protected guard={false}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(recovery)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(settings)" />
          <Stack.Screen name="habit" />
          <Stack.Screen name="streak" />
          <Stack.Screen name="playground" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
