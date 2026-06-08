"use client";

import useSWR from "swr";
import { debtService } from "@/lib/services/debts.service";
import { KEYS } from "@/lib/swr/keys";
import type { Debt } from "@/types/domain";

export function useDebts(userId?: string) {
  const key = userId ? KEYS.debts.list(userId) : KEYS.debts.list("me");

  const { data, error, isLoading } = useSWR(
    key,
    () => debtService.list(userId),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    debts: (data ?? []) as Debt[],
    error,
    isLoading,
  };
}

export function useDebtsSnowball(userId?: string) {
  const key = userId ? KEYS.debts.snowball(userId) : KEYS.debts.snowball("me");

  const { data, error, isLoading } = useSWR(
    key,
    () => debtService.getSnowball(userId),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    snowball: (data ?? []) as (Debt & { calculated_priority?: number | null })[],
    error,
    isLoading,
  };
}
