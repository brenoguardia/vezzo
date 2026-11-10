import { useState } from "react";
import { deleteHabit, patchHabit } from "@/api/habits";
import { Button, HabitFormSkeleton, Text } from "@/components/ui";
import { HabitForm } from "@/features/habits/HabitForm";
import { useHydrating } from "@/features/habits/SyncStatus";
import { useT } from "@/i18n/useT";
import type { GoalUnit } from "@/shared/categories";
import { useHabitsStore } from "@/store/habits";

interface Props {
  id: string | undefined;
  /** Depois de salvar. */
  onSaved: () => void;
  onCancel: () => void;
  /** Depois de arquivar. */
  onArchived: () => void;
}

/** Edição de hábito: tela cheia em `habit/[id]/edit` e painel direito da aba Hábitos no modo dual. */
export function EditHabitPanel({ id, onSaved, onCancel, onArchived }: Props) {
  const t = useT();
  const habit = useHabitsStore((s) => s.habits.find((h) => h.id === id));
  const upsert = useHabitsStore((s) => s.upsertHabit);
  const archive = useHabitsStore((s) => s.archiveHabit);
  const [archiveFailed, setArchiveFailed] = useState(false);
  const hydrating = useHydrating();

  if (!habit) return hydrating ? <HabitFormSkeleton /> : <Text tone="mute">{t("habit.notFound")}</Text>;

  return (
    <HabitForm
      key={habit.id}
      title={t("habit.editTitle")}
      defaultValues={{
        name: habit.name,
        emoji: habit.emoji,
        goalValue: habit.goalValue,
        goalUnit: habit.goalUnit as GoalUnit,
        days: habit.days,
        reminders: habit.reminders,
        quickActions: habit.quickActions,
      }}
      onCancel={onCancel}
      onSubmit={async (values) => {
        const { templateSlug: _ignored, ...patch } = values;
        upsert(await patchHabit(habit.id, patch));
        onSaved();
      }}
      extra={
        <>
          {archiveFailed ? (
            <Text variant="caption" tone="danger" accessibilityRole="alert">
              {t("habit.archiveError")}
            </Text>
          ) : null}
          <Button
            label={t("habit.archive")}
            variant="secondary"
            onPress={async () => {
              try {
                await deleteHabit(habit.id);
                archive(habit.id);
                onArchived();
              } catch {
                setArchiveFailed(true);
              }
            }}
          />
        </>
      }
    />
  );
}
