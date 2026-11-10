import { Stack } from "expo-router";
import { useTheme } from "@/lib/useTheme";

/**
 * Telas de configuração abertas a partir do Perfil (tema, excluir conta, debug de lembretes).
 * Ficam fora de `(tabs)`: no Expo Router 58, rota de aba com `href: null` redireciona para a
 * primeira aba em vez de abrir.
 */
export default function SettingsLayout() {
  const theme = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />;
}
