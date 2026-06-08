"use client";

import useSWR from "swr";
import { goalService } from "@/lib/services/goals.service";
import { KEYS } from "@/lib/swr/keys";
import type { Goal } from "@/types/domain";

export function useGoals(filters?: { assignedTo?: string; creatorId?: string; status?: string }) {
  const key = KEYS.goals.list(filters ?? {});

  const { data, error, isLoading } = useSWR(
    key,
    () => goalService.list(filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    goals: (data ?? []) as (Goal & { goal_progress: { current_saved: number | null; target_amount: number | null } | null })[],
    error,
    isLoading,
  };
}

export function useGoal(goalId?: string) {
  const key = goalId ? KEYS.goals.detail(goalId) : null;

  const { data, error, isLoading } = useSWR(
    key,
    () => (goalId ? goalService.getById(goalId) : undefined),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    goal: data as (Goal & { goal_progress: { current_saved: number | null; target_amount: number | null } | null }) | undefined,
    error,
    isLoading,
  };
}
