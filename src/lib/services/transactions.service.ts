import { getClient, handleError, buildPaginatedResult } from "./_base";
import type { Database } from "@/types/supabase";
import type { TransactionFilters, PaginatedResult } from "@/types/domain";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export const transactionService = {
  async list(filters?: TransactionFilters): Promise<PaginatedResult<Transaction>> {
    const client = getClient();
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = client
      .from("transactions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.isRecurring !== undefined) {
      query = query.eq("is_recurring", filters.isRecurring);
    }
    if (filters?.isPriority !== undefined) {
      query = query.eq("is_priority", filters.isPriority);
    }
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error, count } = await query;
    handleError(error);
    return buildPaginatedResult((data as Transaction[]) ?? [], count, page, limit);
  },

  async getById(id: string) {
    const client = getClient();
    const { data, error } = await client
      .from("transactions")
      .select("*, transaction_tags(tag:tags(*))")
      .eq("id", id)
      .single();
    handleError(error);
    return data;
  },

  async create(transaction: TransactionInsert) {
    const client = getClient();
    const { data, error } = await client
      .from("transactions")
      .insert(transaction)
      .select()
      .single();
    handleError(error);
    return data as Transaction;
  },

  async update(id: string, updates: TransactionUpdate) {
    const client = getClient();
    const { data, error } = await client
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    handleError(error);
    return data as Transaction;
  },

  async delete(id: string) {
    const client = getClient();
    const { error } = await client.from("transactions").delete().eq("id", id);
    handleError(error);
  },

  async getSummary(userId: string, period?: string) {
    const client = getClient();
    let query = client
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId);

    if (period === "month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startOfMonth.toISOString());
    }

    const { data, error } = await query;
    handleError(error);

    const transactions = (data as Transaction[]) ?? [];
    const income = transactions
      .filter((t) => t.type === "income" || (t.type === "budget_assignment" && t.amount > 0))
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense" || (t.type === "budget_assignment" && t.amount < 0))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expense, balance: income - expense };
  },
};
