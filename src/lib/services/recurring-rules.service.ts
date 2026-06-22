import type { Database } from "@/types/supabase";
import { getClient, handleError } from "./_base";

export type RecurringRule =
  Database["public"]["Tables"]["recurring_rules"]["Row"];
export type RecurringRuleInsert =
  Database["public"]["Tables"]["recurring_rules"]["Insert"];
export type RecurringRuleUpdate =
  Database["public"]["Tables"]["recurring_rules"]["Update"];

export const recurringRuleService = {
  async list(userId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("recurring_rules")
      .select("*")
      .eq("user_id", userId)
      .order("next_run_date", { ascending: true });
    handleError(error);
    return (data as RecurringRule[]) ?? [];
  },

  async create(rule: RecurringRuleInsert) {
    const client = getClient();
    const { data, error } = await client
      .from("recurring_rules")
      .insert(rule)
      .select()
      .single();
    handleError(error);
    return data as RecurringRule;
  },

  async update(id: string, updates: RecurringRuleUpdate) {
    const client = getClient();
    const { data, error } = await client
      .from("recurring_rules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    handleError(error);
    return data as RecurringRule;
  },

  async setActive(id: string, isActive: boolean) {
    return recurringRuleService.update(id, { is_active: isActive });
  },

  async delete(id: string) {
    const client = getClient();
    const { error } = await client
      .from("recurring_rules")
      .delete()
      .eq("id", id);
    handleError(error);
  },

  /** Dispara la materialización inmediata (útil para probar sin esperar el cron). */
  async runNow() {
    const client = getClient();
    const { data, error } = await client.rpc("run_due_recurring_rules");
    handleError(error);
    return (data as number) ?? 0;
  },
};
