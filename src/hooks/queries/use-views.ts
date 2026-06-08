"use client";

import useSWR from "swr";
import { viewsService } from "@/lib/services/views.service";
import { KEYS } from "@/lib/swr/keys";

export function useMonthlyExpenses(userId?: string) {
  const key = KEYS.views.monthlyExpenses(userId);

  const { data, error, isLoading } = useSWR(
    key,
    () => viewsService.getMonthlyExpenses(userId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    expenses: (data ?? []).map((item) => ({
      month: item.month ?? new Date().toISOString().slice(0, 7),
      total_expense: item.total_expense ?? 0,
    })),
    error,
    isLoading,
  };
}

export function useGoalProgress(goalId?: string) {
  const key = goalId
    ? KEYS.views.goalProgress(goalId)
    : KEYS.views.goalProgress("all");

  const { data, error, isLoading } = useSWR(
    key,
    () => viewsService.getGoalProgress(goalId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    progress: data,
    error,
    isLoading,
  };
}
