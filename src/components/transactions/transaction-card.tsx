"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Repeat,
  Target,
  Wallet,
} from "lucide-react";
import { m } from "motion/react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/domain";
import { TransactionDetailDialog } from "./transaction-detail-dialog";

interface TransactionCardProps {
  transaction: Transaction;
  index?: number;
  /** Perfil actual: habilita editar/eliminar si es el creador. */
  currentUserId?: string;
}

const typeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  income: {
    label: "Ingreso",
    icon: <ArrowUpRight className="w-4 h-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  expense: {
    label: "Gasto",
    icon: <ArrowDownRight className="w-4 h-4" />,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  budget_assignment: {
    label: "Asignación",
    icon: <Wallet className="w-4 h-4" />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  debt_payment: {
    label: "Pago de deuda",
    icon: <CreditCard className="w-4 h-4" />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  goal_contribution: {
    label: "Meta",
    icon: <Target className="w-4 h-4" />,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TransactionCard({
  transaction,
  index = 0,
  currentUserId,
}: TransactionCardProps) {
  const config = typeConfig[transaction.type] ?? typeConfig.expense;
  const isNegative =
    transaction.type === "expense" ||
    (transaction.type === "budget_assignment" && transaction.amount < 0);

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
    >
      <TransactionDetailDialog
        transaction={transaction}
        currentUserId={currentUserId}
        trigger={
          <button
            type="button"
            className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  config.bg,
                  config.color,
                )}
              >
                {config.icon}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {transaction.description || config.label}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(
                      transaction.created_at ?? new Date().toISOString(),
                    )}
                  </span>
                  {transaction.is_recurring && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <Repeat className="w-3 h-3" />
                      Recurrente
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p
              className={cn(
                "text-sm font-semibold",
                isNegative
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {isNegative ? "-" : "+"}
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </button>
        }
      />
    </m.div>
  );
}
