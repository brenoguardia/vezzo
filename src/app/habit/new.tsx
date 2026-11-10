import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { createHabit } from "@/api/habits";
import { HabitForm } from "@/features/habits/HabitForm";
import { t } from "@/i18n";
import { useTheme } from "@/lib/useTheme";
import { useHabitsStore } from "@/store/habits";

/** Criar hábito (docs/05, tela 8). Exige conexão: o servidor atribui `id` e `order`. */
export default function NewHabit() {
  const router = useRouter();
  const theme = useTheme();
  const upsert = useHabitsStore((s) => s.upsertHabit);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <HabitForm
        title={t("habit.newTitle")}
        showTemplates
        onCancel={() => router.back()}
        onSubmit={async (values) => {
          upsert(await createHabit(values));
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
