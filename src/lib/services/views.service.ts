import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type MonthlyExpenses = Database["public"]["Views"]["monthly_expenses"]["Row"];
export type GoalProgress = Database["public"]["Views"]["goal_progress"]["Row"];
export type DebtsSnowball = Database["public"]["Views"]["v_debts_snowball"]["Row"];

export const viewsService = {
  async getMonthlyExpenses(userId?: string) {
    const client = getClient();
    let query = client
      .from("monthly_expenses")
      .select("*")
      .order("month", { ascending: true });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    handleError(error);
    return (data as MonthlyExpenses[]) ?? [];
  },

  async getGoalProgress(goalId?: string) {
    const client = getClient();

    if (goalId) {
      const { data, error } = await client
        .from("goal_progress")
        .select("*")
        .eq("goal_id", goalId)
        .single();
      handleError(error);
      return data as GoalProgress;
    }

    const { data, error } = await client.from("goal_progress").select("*");
    handleError(error);
    return (data as GoalProgress[]) ?? [];
  },

  async getDebtsSnowball(userId?: string) {
    const client = getClient();
    let query = client
      .from("v_debts_snowball")
      .select("*")
      .order("calculated_priority", { ascending: true });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    handleError(error);
    return (data as DebtsSnowball[]) ?? [];
  },
};
