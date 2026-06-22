"use client";

import useSWR from "swr";
import { recurringRuleService } from "@/lib/services/recurring-rules.service";
import { KEYS } from "@/lib/swr/keys";

export function useRecurringRules(userId?: string) {
  const key = userId ? KEYS.recurringRules.list(userId) : null;

  const { data, error, isLoading } = useSWR(
    key,
    () => (userId ? recurringRuleService.list(userId) : []),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return {
    rules: data ?? [],
    error,
    isLoading,
  };
}
