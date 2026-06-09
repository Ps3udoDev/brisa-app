"use client";

import { useState, useCallback } from "react";
import { debtService } from "@/lib/services/debts.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";
import type { DebtInsert, DebtUpdate } from "@/lib/services/debts.service";

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

export function useUpdateDebt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (id: string, data: DebtUpdate) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await debtService.update(id, data);
      await invalidateWithCascade("debts");
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error };
}

export function usePayDebt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pay = useCallback(async (debtId: string, amount: number, description?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await debtService.payDebt(debtId, amount, description);
      // Pagos de deuda crean transacciones, así que invalidamos ambas entidades
      await invalidateWithCascade("debts");
      await invalidateWithCascade("transactions");
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { pay, isLoading, error };
}
