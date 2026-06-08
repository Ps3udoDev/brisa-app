"use client";

import useSWR from "swr";
import { transactionService } from "@/lib/services/transactions.service";
import { KEYS } from "@/lib/swr/keys";
import type { TransactionFilters } from "@/types/domain";

export function useTransactions(filters?: TransactionFilters) {
  const key = KEYS.transactions.list(filters ?? {});

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => transactionService.list(filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    transactions: data?.data ?? [],
    count: data?.count ?? 0,
    nextPage: data?.nextPage,
    error,
    isLoading,
    mutate,
  };
}

export function useTransactionSummary(userId: string, period?: string) {
  const key = KEYS.transactions.summary(userId, period);

  const { data, error, isLoading } = useSWR(
    key,
    () => transactionService.getSummary(userId, period),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    summary: data,
    error,
    isLoading,
  };
}
