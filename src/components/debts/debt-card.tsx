"use client";

import { m } from "motion/react";
import { CreditCard, Calendar, TrendingDown, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Debt } from "@/types/domain";
import { EditDebtDialog } from "./edit-debt-dialog";

interface DebtCardProps {
  debt: Debt;
  index?: number;
  showPriority?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DebtCard({ debt, index = 0, showPriority = false }: DebtCardProps) {
  const paid = debt.total_amount - debt.current_balance;
  const percent = debt.total_amount > 0 ? Math.min(100, Math.round((paid / debt.total_amount) * 100)) : 0;
  const isPaidOff = debt.current_balance <= 0;

  return (
    <EditDebtDialog debt={debt}>
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 cursor-pointer group"
      >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isPaidOff
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          )}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">{debt.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              Vence: {formatDate(debt.due_date)}
            </p>
          </div>
        </div>
        <div className="text-right">
          {showPriority && debt.priority_order !== null && (
            <span className="text-xs text-slate-400 dark:text-slate-500 block mb-1">
              Prioridad #{debt.priority_order}
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              isPaidOff
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            )}>
              {isPaidOff ? "Liquidada" : "Activa"}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Liquidado
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{percent}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
            className={cn(
              "h-full rounded-full",
              isPaidOff ? "bg-emerald-500" : "bg-orange-500"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Total</p>
          <p className="font-medium text-slate-900 dark:text-white">{formatCurrency(debt.total_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Saldo</p>
          <p className={cn(
            "font-medium",
            isPaidOff ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}>
            {formatCurrency(debt.current_balance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Pagado</p>
          <p className="font-medium text-slate-900 dark:text-white">{formatCurrency(paid)}</p>
        </div>
      </div>

      {debt.interest_rate !== null && debt.interest_rate > 0 && (
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <AlertCircle className="w-3 h-3" />
          Tasa de interés: {debt.interest_rate}%
        </div>
      )}
      </m.div>
    </EditDebtDialog>
  );
}
