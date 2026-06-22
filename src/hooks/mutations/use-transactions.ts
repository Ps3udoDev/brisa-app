"use client";

import { useCallback, useState } from "react";
import type { TransactionInsert } from "@/lib/services/transactions.service";
import { transactionService } from "@/lib/services/transactions.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";

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

export function useDeleteTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionService.deleteTransaction(id);
      await invalidateWithCascade("transactions");
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { remove, isLoading, error };
}

export function useUpdateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (params: { id: string; amount: number; description?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        await transactionService.updateTransaction(params);
        await invalidateWithCascade("transactions");
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { update, isLoading, error };
}

export function useAssignBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const assign = useCallback(
    async (params: {
      fromUserId: string;
      toUserId: string;
      amount: number;
      description?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await transactionService.assignBudget(params);
        // Mutar transactions también invalida user_balances (cascada),
        // por lo que el saldo del jefe y del asociado se refrescan.
        await invalidateWithCascade("transactions");
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { assign, isLoading, error };
}
