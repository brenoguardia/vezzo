import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "name" };

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Depois de salvar no servidor não há volta: o POST já foi feito. */}
      <Stack.Screen name="reminders" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
