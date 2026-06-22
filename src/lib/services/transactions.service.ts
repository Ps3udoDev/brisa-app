import type { PaginatedResult, TransactionFilters } from "@/types/domain";
import type { Database } from "@/types/supabase";
import { buildPaginatedResult, getClient, handleError } from "./_base";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

export const transactionService = {
  async list(
    filters?: TransactionFilters,
  ): Promise<PaginatedResult<Transaction>> {
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
    return buildPaginatedResult(
      (data as Transaction[]) ?? [],
      count,
      page,
      limit,
    );
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

  /**
   * Asigna presupuesto de un superior a un subordinado de forma atómica.
   * Llama a la RPC `assign_budget`, que verifica saldo suficiente, crea el par
   * débito/crédito de transacciones y deja que los triggers ajusten ambos
   * `user_balances`. Es el ÚNICO camino correcto para mover saldo entre cuentas.
   */
  async assignBudget(params: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    description?: string;
  }) {
    const client = getClient();
    const { data, error } = await client.rpc("assign_budget", {
      from_user: params.fromUserId,
      to_user: params.toUserId,
      amount: params.amount,
      descr: params.description ?? "",
    });
    handleError(error);
    return (data ?? []) as { t1_id: string; t2_id: string }[];
  },

  /**
   * Elimina una transacción revirtiendo el saldo (y la deuda) correctamente.
   * Vía RPC `delete_transaction`, que solo permite al creador y maneja cada tipo:
   * asignación → borra el par; pago de deuda → restaura la deuda; resto → reversa.
   */
  async deleteTransaction(id: string) {
    const client = getClient();
    const { error } = await client.rpc("delete_transaction", { p_tx_id: id });
    handleError(error);
  },

  /**
   * Edita monto/descripción de una transacción del creador, ajustando saldo,
   * par de asignación o deuda según el tipo. `amount` es siempre positivo.
   */
  async updateTransaction(params: {
    id: string;
    amount: number;
    description?: string;
  }) {
    const client = getClient();
    const { error } = await client.rpc("update_transaction", {
      p_tx_id: params.id,
      p_amount: params.amount,
      p_description: params.description,
    });
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
      .filter(
        (t) =>
          t.type === "income" ||
          (t.type === "budget_assignment" && t.amount > 0),
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(
        (t) =>
          t.type === "expense" ||
          (t.type === "budget_assignment" && t.amount < 0),
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expense, balance: income - expense };
  },
};
