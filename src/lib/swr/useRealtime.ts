"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";
import { createBrowserSB } from "@/lib/supabase/client";
import { toast } from "sonner";

const TABLES_TO_WATCH = [
  "transactions",
  "budget_requests",
  "goals",
  "debts",
  "debt_payments",
  "permissions",
] as const;

type TableName = (typeof TABLES_TO_WATCH)[number];

const TABLE_TO_ENTITY: Record<TableName, string> = {
  transactions: "transactions",
  budget_requests: "budget_requests",
  goals: "goals",
  debts: "debts",
  debt_payments: "debts",
  permissions: "profiles",
};

const TABLE_TO_TOAST: Partial<Record<TableName, (payload: unknown) => string>> = {
  budget_requests: () => "Nueva solicitud de presupuesto recibida",
  goals: () => "Actualización en tus metas",
};

export function useRealtimeInvalidator(userId?: string) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (!userId) return;

    const supabase = createBrowserSB();
    const channels: ReturnType<typeof supabase.channel>[] = [];

    for (const table of TABLES_TO_WATCH) {
      const channel = supabase
        .channel(`realtime:${table}:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
          },
          (payload) => {
            const entity = TABLE_TO_ENTITY[table];
            // Invalidar la entidad afectada
            mutate(
              (key) =>
                Array.isArray(key) &&
                key[0] === "brisa" &&
                key[1] === entity,
              undefined,
              { revalidate: true }
            );

            // Mostrar toast si aplica
            const getMessage = TABLE_TO_TOAST[table];
            if (getMessage) {
              toast.info(getMessage(payload));
            }
          }
        )
        .subscribe();

      channels.push(channel);
    }

    return () => {
      for (const channel of channels) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, mutate]);
}
