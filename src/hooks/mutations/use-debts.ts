"use client";

import { useState, useCallback } from "react";
import { debtService } from "@/lib/services/debts.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";
import type { DebtInsert } from "@/lib/services/debts.service";

export function useCreateDebt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: DebtInsert) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await debtService.create(data);
      await invalidateWithCascade("debts");
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
