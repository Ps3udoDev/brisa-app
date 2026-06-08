import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export const notificationService = {
  async list(userId: string, opts?: { unreadOnly?: boolean; limit?: number }) {
    const client = getClient();
    let query = client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (opts?.unreadOnly) {
      query = query.eq("read", false);
    }
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }

    const { data, error } = await query;
    handleError(error);
    return (data as Notification[]) ?? [];
  },

  async getUnreadCount(userId: string) {
    const client = getClient();
    const { count, error } = await client
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);
    handleError(error);
    return count ?? 0;
  },

  async markAsRead(id: string) {
    const client = getClient();
    const { error } = await client
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    handleError(error);
  },

  async markAllAsRead(userId: string) {
    const client = getClient();
    const { error } = await client
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    handleError(error);
  },
};
