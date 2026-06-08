"use client";

import { useState, useCallback } from "react";
import { goalService } from "@/lib/services/goals.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";
import type { GoalInsert } from "@/lib/services/goals.service";

export function useCreateGoal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: GoalInsert) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await goalService.create(data);
      await invalidateWithCascade("goals");
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
