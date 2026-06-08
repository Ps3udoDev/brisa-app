"use client";

import useSWR from "swr";
import { userBalanceService } from "@/lib/services/user-balances.service";
import { KEYS } from "@/lib/swr/keys";

export function useUserBalance(userId?: string) {
  const key = userId
    ? KEYS.userBalances.detail(userId)
    : KEYS.userBalances.detail("me");

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => {
      if (userId) {
        return userBalanceService.getByUserId(userId);
      }
      return userBalanceService.getMe();
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    balance: data,
    error,
    isLoading,
    mutate,
  };
}
