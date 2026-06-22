import type { Database } from "@/types/supabase";
import { getClient, handleError } from "./_base";

type SubscriptionJson =
  Database["public"]["Tables"]["push_subscriptions"]["Row"]["subscription"];

export const pushSubscriptionService = {
  /** Guarda (o actualiza) la suscripción push del dispositivo actual. */
  async save(sub: PushSubscriptionJSON, userAgent?: string) {
    const client = getClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("No autenticado");
    if (!sub.endpoint) throw new Error("Suscripción inválida");

    const { error } = await client.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: sub.endpoint,
        subscription: sub as unknown as SubscriptionJson,
        user_agent: userAgent ?? null,
      },
      { onConflict: "endpoint" },
    );
    handleError(error);
  },

  /** Elimina la suscripción de este dispositivo (al desactivar). */
  async removeByEndpoint(endpoint: string) {
    const client = getClient();
    const { error } = await client
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);
    handleError(error);
  },
};
