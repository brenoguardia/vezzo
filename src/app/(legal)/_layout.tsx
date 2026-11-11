import { Stack } from "expo-router";
import { useTheme } from "@/lib/useTheme";

/** Páginas públicas (Termos e Privacidade): acessíveis com ou sem sessão, no app e na web. */
export default function LegalLayout() {
  const theme = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />;
}
