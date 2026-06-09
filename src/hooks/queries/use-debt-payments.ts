"use client";

import useSWR from "swr";
import { debtService } from "@/lib/services/debts.service";

export function useDebtPayments(debtId?: string) {
  const key = debtId ? ["brisa", "debt_payments", debtId] : null;

  const { data, error, isLoading } = useSWR(
    key,
    () => (debtId ? debtService.getPayments(debtId) : []),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    payments: data ?? [],
    error,
    isLoading,
  };
}
