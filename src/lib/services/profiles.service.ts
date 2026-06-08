import { getClient, handleError } from "./_base";
import type { Database } from "@/types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profileService = {
  async getMe() {
    const client = getClient();

    // 1. Obtenemos el usuario autenticado
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      throw new Error("No se pudo obtener el usuario autenticado");
    }

    // 2. Traemos el perfil filtrando por ID
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    handleError(error);

    // Si por alguna razón extrema la data es nula, lanzamos un error preventivo para TypeScript
    if (!data) {
      throw new Error("Perfil no encontrado");
    }

    // 3. Consultamos el balance usando data.id con total seguridad
    const { data: balance } = await client
      .from("user_balances")
      .select("balance")
      .eq("user_id", data.id) // 🔥 Aquí TypeScript ya sabe que data NO es null
      .maybeSingle();

    return { ...data, user_balances: balance } as Profile & {
      user_balances: { balance: number } | null;
    };
  },

  async getById(id: string) {
    const client = getClient();
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    handleError(error);

    const { data: balance } = await client
      .from("user_balances")
      .select("balance")
      .eq("user_id", id)
      .maybeSingle();

    return { ...data, user_balances: balance } as Profile & {
      user_balances: { balance: number } | null;
    };
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
    return {
      data:
        (data as (Profile & { user_balances?: { balance: number } | null })[]) ??
        [],
      count,
    };
  },

  async getSubordinates(parentId: string) {
    const client = getClient();
    const { data, error } = await client.rpc("get_all_subordinates", {
      parent_id: parentId,
    });
    handleError(error);
    return (data as string[]) ?? [];
  },

  async getSubordinateProfiles(parentId: string) {
    const client = getClient();
    const { data, error } = await client.rpc("get_all_subordinates", {
      parent_id: parentId,
    });
    handleError(error);
    const ids = (data as string[]) ?? [];
    if (ids.length === 0) return [];

    const { data: profiles, error: profilesError } = await client
      .from("profiles")
      .select("*, user_balances(balance)")
      .in("id", ids)
      .order("role", { ascending: false })
      .order("first_name", { ascending: true });

    handleError(profilesError);
    return (profiles as (Profile & { user_balances?: { balance: number } | null })[]) ?? [];
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
