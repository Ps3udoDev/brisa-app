"use client";

import { useState, useCallback } from "react";
import { transactionService } from "@/lib/services/transactions.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";
import type { TransactionInsert } from "@/lib/services/transactions.service";

export function useCreateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: TransactionInsert) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transactionService.create(data);
      await invalidateWithCascade("transactions");
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
}
