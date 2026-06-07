import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profileService = {
  async getMe() {
    const client = getClient();
    const { data, error } = await client
      .from("profiles")
      .select("*, user_balances(*)")
      .single();
    handleError(error);
    return data as Profile & { user_balances: { balance: number } | null };
  },

  async getById(id: string) {
    const client = getClient();
    const { data, error } = await client
      .from("profiles")
      .select("*, user_balances(*)")
      .eq("id", id)
      .single();
    handleError(error);
    return data as Profile & { user_balances: { balance: number } | null };
  },

  async list(filters?: { role?: string; parentId?: string | null }) {
    const client = getClient();
    let query = client.from("profiles").select("*, user_balances(balance)", {
      count: "exact",
    });

    if (filters?.role) {
      query = query.eq("role", filters.role);
    }
    if (filters?.parentId !== undefined) {
      query =
        filters.parentId === null
          ? query.is("parent_id", null)
          : query.eq("parent_id", filters.parentId);
    }

    const { data, error, count } = await query;
    handleError(error);
    return { data: (data as Profile[]) ?? [], count };
  },

  async getSubordinates(parentId: string) {
    const client = getClient();
    const { data, error } = await client.rpc("get_all_subordinates", {
      parent_id: parentId,
    });
    handleError(error);
    return (data as string[]) ?? [];
  },

  async update(id: string, updates: ProfileUpdate) {
    const client = getClient();
    const { data, error } = await client
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    handleError(error);
    return data as Profile;
  },

  async isSubordinateOf(userId: string, superiorId: string) {
    const client = getClient();
    const { data, error } = await client.rpc("is_subordinate_of", {
      user_id: userId,
      superior_id: superiorId,
    });
    handleError(error);
    return data as boolean;
  },
};
