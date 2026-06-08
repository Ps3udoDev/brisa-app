"use client";

import useSWR from "swr";
import { budgetRequestService } from "@/lib/services/budget-requests.service";
import { KEYS } from "@/lib/swr/keys";
import type { BudgetRequest } from "@/types/domain";

export function useBudgetRequestInbox(toUserId?: string) {
  const key = toUserId ? KEYS.budgetRequests.inbox(toUserId) : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => (toUserId ? budgetRequestService.inbox(toUserId) : []),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    requests: (data ?? []) as (BudgetRequest & { from_user?: { first_name: string | null; last_name1: string | null; role: string } | null })[],
    error,
    isLoading,
    mutate,
  };
}

export function useBudgetRequestSent(fromUserId?: string) {
  const key = fromUserId ? KEYS.budgetRequests.sent(fromUserId) : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => (fromUserId ? budgetRequestService.sent(fromUserId) : []),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    requests: (data ?? []) as (BudgetRequest & { to_user?: { first_name: string | null; last_name1: string | null; role: string } | null })[],
    error,
    isLoading,
    mutate,
  };
}
