import { Stack } from "expo-router";
import { useTheme } from "@/lib/useTheme";

export default function HabitLayout() {
  const theme = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />;
}
