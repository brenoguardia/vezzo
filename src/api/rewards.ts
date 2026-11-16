import { apiFetch } from "@/api/client";
import { type RewardProgressDto, rewardProgressDto } from "@/shared/schemas";

export function fetchRewardProgress(habitId: string): Promise<RewardProgressDto> {
  return apiFetch(`/v1/habits/${habitId}/reward`, rewardProgressDto);
}

export function claimReward(habitId: string): Promise<RewardProgressDto> {
  return apiFetch(`/v1/habits/${habitId}/reward/claim`, rewardProgressDto, { method: "POST", body: "{}" });
}
