"use client";

import { useCallback, useState } from "react";
import type { GoalInsert } from "@/lib/services/goals.service";
import { goalService } from "@/lib/services/goals.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";

export function useCreateGoal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (
      data: GoalInsert,
      contributors?: { user_id: string; committed_amount: number }[],
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const goal = await goalService.create(data);
        if (contributors && contributors.length > 0) {
          await goalService.addContributors(goal.id, contributors);
        }
        await invalidateWithCascade("goals");
        return goal;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { create, isLoading, error };
}

export function useContributeToGoal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const contribute = useCallback(
    async (goalId: string, amount: number, description?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await goalService.contribute(
          goalId,
          amount,
          description,
        );
        // Mutar goals invalida goal_progress; el aporte es una transacción, así
        // que también refrescamos transactions/user_balances.
        await invalidateWithCascade("goals");
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

  return { contribute, isLoading, error };
}
