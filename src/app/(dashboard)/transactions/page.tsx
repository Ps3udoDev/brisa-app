"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Receipt,
  Wallet,
} from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { StatCard } from "@/components/data-display/stat-card";
import { CreateTransactionDialog } from "@/components/transactions/create-transaction-dialog";
import { RecurringRulesSection } from "@/components/transactions/recurring-rules-section";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { useProfile } from "@/hooks/queries/use-profile";
import { useTransactions } from "@/hooks/queries/use-transactions";

const typeFilters: { value: string; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Gastos" },
  { value: "budget_assignment", label: "Asignaciones" },
  { value: "debt_payment", label: "Pagos deuda" },
  { value: "goal_contribution", label: "Metas" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function TransactionsPage() {
  const { profile: me } = useProfile();
  const [typeFilter, setTypeFilter] = useState("all");

  const filters =
    typeFilter === "all"
      ? { userId: me?.id, limit: 50 }
      : {
          userId: me?.id,
          type: typeFilter as
            | "income"
            | "expense"
            | "budget_assignment"
            | "debt_payment"
            | "goal_contribution",
          limit: 50,
        };

  const { transactions, isLoading } = useTransactions(filters);

  const income = transactions
    .filter(
      (t) =>
        t.type === "income" || (t.type === "budget_assignment" && t.amount > 0),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(
      (t) =>
        t.type === "expense" ||
        (t.type === "budget_assignment" && t.amount < 0),
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = income - expense;

  return (
    <div className="space-y-8">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">
            Transacciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Registra y revisa todos tus movimientos financieros
          </p>
        </div>

        <CreateTransactionDialog />
      </m.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Ingresos"
          amount={formatCurrency(income)}
          icon={<ArrowUpRight className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Gastos"
          amount={formatCurrency(expense)}
          icon={<ArrowDownRight className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Balance"
          amount={formatCurrency(balance)}
          icon={<Wallet className="w-5 h-5" />}
          delay={0.2}
        />
      </div>

      {/* Pagos recurrentes */}
      <RecurringRulesSection />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {typeFilters.map((filter) => (
          <button
            type="button"
            key={filter.value}
            onClick={() => setTypeFilter(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === filter.value
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading && transactions.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : transactions.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No hay transacciones registradas
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Crea tu primera transacción con el botón de arriba
          </p>
        </m.div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              index={i}
              currentUserId={me?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
