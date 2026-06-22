"use client";

import { useCallback, useState } from "react";
import type { RecurringRuleInsert } from "@/lib/services/recurring-rules.service";
import { recurringRuleService } from "@/lib/services/recurring-rules.service";
import { invalidateWithCascade } from "@/lib/swr/invalidate";

export function useRecurringRuleMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      await invalidateWithCascade("recurring_rules");
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(
    (rule: RecurringRuleInsert) => run(() => recurringRuleService.create(rule)),
    [run],
  );

  const setActive = useCallback(
    (id: string, isActive: boolean) =>
      run(() => recurringRuleService.setActive(id, isActive)),
    [run],
  );

  const remove = useCallback(
    (id: string) => run(() => recurringRuleService.delete(id)),
    [run],
  );

  const runNow = useCallback(
    () => run(() => recurringRuleService.runNow()),
    [run],
  );

  return { create, setActive, remove, runNow, isLoading, error };
}
