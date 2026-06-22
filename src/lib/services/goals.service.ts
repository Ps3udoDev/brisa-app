import type { Database } from "@/types/supabase";
import { getClient, handleError } from "./_base";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];
export type GoalProgress = Database["public"]["Views"]["goal_progress"]["Row"];

export type GoalContributor =
  Database["public"]["Tables"]["goal_contributors"]["Row"] & {
    profile?: {
      first_name: string | null;
      last_name1: string | null;
      role: string;
    } | null;
  };

export const goalService = {
  async list(filters?: {
    assignedTo?: string;
    creatorId?: string;
    userId?: string;
    status?: string;
  }) {
    const client = getClient();
    let query = client
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.userId) {
      query = query.or(
        `creator_id.eq.${filters.userId},assigned_to.eq.${filters.userId}`,
      );
    } else {
      if (filters?.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }
      if (filters?.creatorId) {
        query = query.eq("creator_id", filters.creatorId);
      }
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
      .in(
        "goal_id",
        goals.map((g) => g.id),
      );

    const progressMap = new Map(
      ((progressData as GoalProgress[]) ?? []).map((p) => [p.goal_id, p]),
    );

    // Contribuyentes de todas las metas en una sola query
    const { data: contribData } = await client
      .from("goal_contributors")
      .select("*, profile:profiles(first_name, last_name1, role)")
      .in(
        "goal_id",
        goals.map((g) => g.id),
      );

    const contributorsMap = new Map<string, GoalContributor[]>();
    for (const c of (contribData as GoalContributor[]) ?? []) {
      const list = contributorsMap.get(c.goal_id) ?? [];
      list.push(c);
      contributorsMap.set(c.goal_id, list);
    }

    return goals.map((g) => ({
      ...g,
      goal_progress: progressMap.get(g.id) ?? null,
      contributors: contributorsMap.get(g.id) ?? [],
    })) as (Goal & {
      goal_progress: GoalProgress | null;
      contributors: GoalContributor[];
    })[];
  },

  async listContributors(goalId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("goal_contributors")
      .select("*, profile:profiles(first_name, last_name1, role)")
      .eq("goal_id", goalId);
    handleError(error);
    return (data as GoalContributor[]) ?? [];
  },

  async addContributors(
    goalId: string,
    rows: { user_id: string; committed_amount: number }[],
  ) {
    if (rows.length === 0) return;
    const client = getClient();
    const { error } = await client.from("goal_contributors").upsert(
      rows.map((r) => ({
        goal_id: goalId,
        user_id: r.user_id,
        committed_amount: r.committed_amount,
      })),
      { onConflict: "goal_id,user_id" },
    );
    handleError(error);
  },

  /**
   * Registra un aporte real a la meta de forma atómica (RPC contribute_to_goal):
   * crea la transacción goal_contribution negativa ligada a la meta y descuenta
   * el saldo del aportante (verifica saldo suficiente).
   */
  async contribute(goalId: string, amount: number, description?: string) {
    const client = getClient();
    const { data, error } = await client.rpc("contribute_to_goal", {
      p_goal_id: goalId,
      p_amount: amount,
      p_description: description ?? "",
    });
    handleError(error);
    return data as string;
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
