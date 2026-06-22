"use client";

import { ArrowDownRight, ArrowUpRight, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { RecurringRuleDialog } from "@/components/transactions/recurring-rule-dialog";
import { Button } from "@/components/ui/button";
import { useRecurringRuleMutations } from "@/hooks/mutations/use-recurring-rules";
import { useProfile } from "@/hooks/queries/use-profile";
import { useRecurringRules } from "@/hooks/queries/use-recurring-rules";
import type { RecurringRule } from "@/lib/services/recurring-rules.service";

const freqLabels: Record<string, string> = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RuleRow({ rule }: { rule: RecurringRule }) {
  const { setActive, remove, isLoading } = useRecurringRuleMutations();
  const [busy, setBusy] = useState(false);
  const isExpense = rule.type === "expense";

  async function toggle() {
    setBusy(true);
    try {
      await setActive(rule.id, !rule.is_active);
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    setBusy(true);
    try {
      await remove(rule.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isExpense
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}
        >
          {isExpense ? (
            <ArrowDownRight className="w-4 h-4" />
          ) : (
            <ArrowUpRight className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {rule.description ||
              (isExpense ? "Gasto recurrente" : "Ingreso recurrente")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {freqLabels[rule.frequency] ?? rule.frequency} ·{" "}
            {formatCurrency(rule.amount)} · próximo:{" "}
            {formatDate(rule.next_run_date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || isLoading}
          onClick={toggle}
          className={
            rule.is_active
              ? "text-slate-600 dark:text-slate-300"
              : "text-emerald-700 dark:text-emerald-400"
          }
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : rule.is_active ? (
            "Pausar"
          ) : (
            "Reanudar"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={busy || isLoading}
          onClick={del}
          className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function RecurringRulesSection() {
  const { profile: me } = useProfile();
  const { rules, isLoading } = useRecurringRules(me?.id);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-medium text-slate-900 dark:text-white">
            Pagos recurrentes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Se registran solos a las 12:00 de tu zona horaria
          </p>
        </div>
        <RecurringRuleDialog />
      </div>

      {isLoading && rules.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : rules.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
          No tienes pagos recurrentes programados.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </div>
      )}
    </div>
  );
}
