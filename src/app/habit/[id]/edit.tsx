import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EditHabitPanel } from "@/features/habits/EditHabitPanel";
import { useTheme } from "@/lib/useTheme";

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <EditHabitPanel id={id} onSaved={() => router.back()} onCancel={() => router.back()} onArchived={() => router.dismissAll()} />
    </SafeAreaView>
  );
}
