"use client";

import { useState, useCallback } from "react";
import { budgetRequestService } from "@/lib/services/budget-requests.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";
import type { BudgetRequestInsert } from "@/lib/services/budget-requests.service";

export function useCreateBudgetRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: BudgetRequestInsert) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await budgetRequestService.create(data);
      await invalidateWithCascade("budget_requests");
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

export function useApproveBudgetRequest() {
  const [isLoading, setIsLoading] = useState(false);

  const approve = useCallback(async (reqId: string) => {
    setIsLoading(true);
    try {
      await budgetRequestService.approve(reqId);
      await invalidateWithCascade("budget_requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { approve, isLoading };
}

export function useRejectBudgetRequest() {
  const [isLoading, setIsLoading] = useState(false);

  const reject = useCallback(async (reqId: string) => {
    setIsLoading(true);
    try {
      await budgetRequestService.reject(reqId);
      await invalidateWithCascade("budget_requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reject, isLoading };
}
