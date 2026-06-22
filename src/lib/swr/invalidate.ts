import { mutate, type SWRConfiguration } from "swr";
import { matchEntity } from "./keys";

/**
 * Invalida todas las keys de una entidad.
 * Ej: invalidateEntity('transactions') borra list, detail, summary.
 */
export const invalidateEntity = async (entity: string) => {
  await mutate(matchEntity(entity), undefined, { revalidate: true });
};

/**
 * Invalida un conjunto específico de keys.
 */
export const invalidateKeys = async (
  keys: (readonly (string | number | object | undefined)[])[],
  opts?: SWRConfiguration,
) => {
  await Promise.all(
    keys.map((k) => mutate(k, undefined, { ...opts, revalidate: true })),
  );
};

// ── Mapa de dependencias entre entidades ──
// Cuando mutas X, también debes invalidar Y.
export const CASCADE_INVALIDATIONS: Record<string, string[]> = {
  transactions: [
    "user_balances",
    "monthly_expenses",
    "goal_progress",
    "v_debts_snowball",
    "budget_requests",
  ],
  budget_requests: ["transactions", "user_balances"],
  debts: ["v_debts_snowball", "user_balances"],
  goals: ["goal_progress"],
  profiles: ["profiles", "user_balances", "permissions"],
  // Materializar reglas crea transacciones (afecta saldos); útil cuando se
  // ejecuta "ahora" desde la app.
  recurring_rules: ["transactions", "user_balances"],
};

export const invalidateWithCascade = async (sourceEntity: string) => {
  const targets = new Set([
    sourceEntity,
    ...(CASCADE_INVALIDATIONS[sourceEntity] ?? []),
  ]);
  await Promise.all([...targets].map((e) => invalidateEntity(e)));
};
