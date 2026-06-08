import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type Debt = Database["public"]["Tables"]["debts"]["Row"];
export type DebtInsert = Database["public"]["Tables"]["debts"]["Insert"];
export type DebtUpdate = Database["public"]["Tables"]["debts"]["Update"];
export type DebtsSnowball = Database["public"]["Views"]["v_debts_snowball"]["Row"];

export const debtService = {
  async list(userId?: string) {
    const client = getClient();
    let query = client
      .from("debts")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    handleError(error);
    return (data as Debt[]) ?? [];
  },

  async getSnowball(userId?: string) {
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

  async getById(id: string) {
    const client = getClient();
    const { data, error } = await client
      .from("debts")
      .select("*")
      .eq("id", id)
      .single();
    handleError(error);
    return data as Debt;
  },

  async create(debt: DebtInsert) {
    const client = getClient();
    const { data, error } = await client
      .from("debts")
      .insert(debt)
      .select()
      .single();
    handleError(error);
    return data as Debt;
  },

  async update(id: string, updates: DebtUpdate) {
    const client = getClient();
    const { data, error } = await client
      .from("debts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    handleError(error);
    return data as Debt;
  },

  async delete(id: string) {
    const client = getClient();
    const { error } = await client.from("debts").delete().eq("id", id);
    handleError(error);
  },
};
