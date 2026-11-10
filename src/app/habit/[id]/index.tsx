import { useLocalSearchParams } from "expo-router";
import { HabitDetailView } from "@/features/habits/HabitDetailView";
import { SettingsShell } from "@/features/profile/SettingsShell";

/** Detalhe do hábito em tela cheia (docs/05, tela 7). No modo dual o mesmo conteúdo vive no painel direito de Hoje. */
export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SettingsShell back>
      <HabitDetailView id={id} />
    </SettingsShell>
  );
}
