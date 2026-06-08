import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];
export type GoalProgress = Database["public"]["Views"]["goal_progress"]["Row"];

export const goalService = {
  async list(filters?: { assignedTo?: string; creatorId?: string; status?: string }) {
    const client = getClient();
    let query = client
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }
    if (filters?.creatorId) {
      query = query.eq("creator_id", filters.creatorId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    handleError(error);
    const goals = (data as Goal[]) ?? [];
    if (goals.length === 0) return [];

    // Obtener progreso de todas las metas en una sola query
    const { data: progressData } = await client
      .from("goal_progress")
      .select("*")
      .in("goal_id", goals.map((g) => g.id));

    const progressMap = new Map(
      (progressData as GoalProgress[] ?? []).map((p) => [p.goal_id, p])
    );

    return goals.map((g) => ({
      ...g,
      goal_progress: progressMap.get(g.id) ?? null,
    })) as (Goal & { goal_progress: GoalProgress | null })[];
  },

  async getProgress(goalId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("goal_progress")
      .select("*")
      .eq("goal_id", goalId)
      .maybeSingle();
    handleError(error);
    return data as GoalProgress | null;
  },

  async getById(id: string) {
    const client = getClient();
    const { data, error } = await client
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();
    handleError(error);
    return data as Goal;
  },

  async create(goal: GoalInsert) {
    const client = getClient();
    const { data, error } = await client
      .from("goals")
      .insert(goal)
      .select()
      .single();
    handleError(error);
    return data as Goal;
  },

  async update(id: string, updates: GoalUpdate) {
    const client = getClient();
    const { data, error } = await client
      .from("goals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    handleError(error);
    return data as Goal;
  },

  async delete(id: string) {
    const client = getClient();
    const { error } = await client.from("goals").delete().eq("id", id);
    handleError(error);
  },
};
