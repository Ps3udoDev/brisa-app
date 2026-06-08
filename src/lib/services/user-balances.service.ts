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
      .maybeSingle(); // 🧠 Cambiado a maybeSingle para evitar el error si da 0 filas
    
    handleError(error);

    // Si no existe el registro en la base de datos, retornamos un balance por defecto en lugar de null
    if (!data) {
      return { user_id: userId, balance: 0, updated_at: new Date().toISOString() } as UserBalance;
    }

    return data as UserBalance;
  },

  async getMe() {
    const client = getClient();

    // 1. Obtenemos primero el ID del usuario con la sesión activa
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      throw new Error("No se pudo obtener el usuario autenticado");
    }

    // 2. Buscamos el balance filtrando explícitamente por el usuario de la sesión
    const { data, error } = await client
      .from("user_balances")
      .select("*")
      .eq("user_id", user.id) // 🔒 Filtro indispensable por seguridad y precisión
      .maybeSingle(); // 🧠 Evita el crash si es un usuario nuevo sin transacciones
    
    handleError(error);

    if (!data) {
      return { user_id: user.id, balance: 0, updated_at: new Date().toISOString() } as UserBalance;
    }

    return data as UserBalance;
  },
};