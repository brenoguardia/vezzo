import { z } from "zod";
import { apiFetch } from "@/api/client";
import { type HabitDto, type HabitInput, habitDto } from "@/shared/schemas";

export type HabitPatchInput = Partial<Omit<HabitInput, "templateSlug">> & { archived?: boolean };

export function createHabit(input: HabitInput): Promise<HabitDto> {
  return apiFetch("/v1/habits", habitDto, { method: "POST", body: JSON.stringify(input) });
}

export function patchHabit(id: string, patch: HabitPatchInput): Promise<HabitDto> {
  return apiFetch(`/v1/habits/${id}`, habitDto, { method: "PATCH", body: JSON.stringify(patch) });
}

/** Arquiva (padrão) ou exclui de vez (`hard`). */
export async function deleteHabit(id: string, hard = false): Promise<void> {
  await apiFetch(`/v1/habits/${id}?hard=${hard}`, z.object({ ok: z.boolean() }), { method: "DELETE" });
}

/** Volta um hábito arquivado para a lista de ativos. */
export const unarchiveHabit = (id: string): Promise<HabitDto> => patchHabit(id, { archived: false });
