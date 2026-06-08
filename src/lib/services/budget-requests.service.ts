import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type BudgetRequest = Database["public"]["Tables"]["budget_requests"]["Row"];
export type BudgetRequestInsert = Database["public"]["Tables"]["budget_requests"]["Insert"];

export const budgetRequestService = {
  async inbox(toUserId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("budget_requests")
      .select("*, from_user:profiles!budget_requests_from_user_id_fkey(first_name, last_name1, role)")
      .eq("to_user_id", toUserId)
      .order("created_at", { ascending: false });
    handleError(error);
    return (data as (BudgetRequest & { from_user?: { first_name: string | null; last_name1: string | null; role: string } | null })[]) ?? [];
  },

  async sent(fromUserId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("budget_requests")
      .select("*, to_user:profiles!budget_requests_to_user_id_fkey(first_name, last_name1, role)")
      .eq("from_user_id", fromUserId)
      .order("created_at", { ascending: false });
    handleError(error);
    return (data as (BudgetRequest & { to_user?: { first_name: string | null; last_name1: string | null; role: string } | null })[]) ?? [];
  },

  async create(request: BudgetRequestInsert) {
    const client = getClient();
    const { data, error } = await client
      .from("budget_requests")
      .insert(request)
      .select()
      .single();
    handleError(error);
    return data as BudgetRequest;
  },

  async approve(reqId: string) {
    const client = getClient();
    const { error } = await client.rpc("approve_budget_request", {
      req_id: reqId,
    });
    handleError(error);
  },

  async reject(reqId: string) {
    const client = getClient();
    const { error } = await client
      .from("budget_requests")
      .update({ status: "rejected" })
      .eq("id", reqId);
    handleError(error);
  },
};
