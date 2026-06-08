import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type UserBalance = Database["public"]["Tables"]["user_balances"]["Row"];

export const userBalanceService = {
  async getByUserId(userId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("user_balances")
      .select("*")
      .eq("user_id", userId)
      .single();
    handleError(error);
    return data as UserBalance;
  },

  async getMe() {
    const client = getClient();
    const { data, error } = await client
      .from("user_balances")
      .select("*")
      .single();
    handleError(error);
    return data as UserBalance;
  },
};
