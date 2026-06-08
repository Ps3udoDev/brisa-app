"use client";

import { useState, useMemo } from "react";
import { m } from "motion/react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { IncomeExpenseChart } from "@/components/reports/income-expense-chart";
import { TransactionsTable } from "@/components/reports/transactions-table";
import { StatCard } from "@/components/data-display/stat-card";
import { Loader2, TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const periods = [
  { label: "Este mes", value: "this_month" },
  { label: "Mes pasado", value: "last_month" },
  { label: "Este año", value: "this_year" },
  { label: "Todo", value: "all" },
];

function getPeriodDates(period: string) {
  const now = new Date();
  switch (period) {
    case "this_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
      };
    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        start: lastMonth.toISOString(),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString(),
      };
    }
    case "this_year":
      return {
        start: new Date(now.getFullYear(), 0, 1).toISOString(),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString(),
      };
    default:
      return undefined;
  }
}

function groupByMonth(transactions: { created_at: string | null; amount: number; type: string }[]) {
  const grouped = new Map<string, { income: number; expense: number }>();

  transactions.forEach((t) => {
    if (!t.created_at) return;
    const date = new Date(t.created_at);
    const key = date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
    const current = grouped.get(key) ?? { income: 0, expense: 0 };

    if (t.type === "income" || (t.type === "budget_assignment" && t.amount > 0)) {
      current.income += t.amount;
    } else {
      current.expense += Math.abs(t.amount);
    }
    grouped.set(key, current);
  });

  return Array.from(grouped.entries()).map(([label, values]) => ({
    label,
    ...values,
  }));
}

export default function ReportsPage() {
  const { profile: me } = useProfile();
  const [period, setPeriod] = useState("this_month");

  const dates = getPeriodDates(period);
  const filters = useMemo(
    () => ({
      userId: me?.id,
      limit: 100,
      startDate: dates?.start,
      endDate: dates?.end,
    }),
    [me?.id, dates]
  );

  const { transactions, isLoading } = useTransactions(filters);

  const income = transactions
    .filter((t) => t.type === "income" || (t.type === "budget_assignment" && t.amount > 0))
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense" || (t.type === "budget_assignment" && t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const chartData = useMemo(() => groupByMonth(transactions), [transactions]);

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
            Reportes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Análisis detallado de tus finanzas
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {periods.map((p) => (
            <button
              type="button"
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p.value
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </m.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos"
          amount={formatCurrency(income)}
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Gastos"
          amount={formatCurrency(expense)}
          icon={<TrendingDown className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Balance"
          amount={formatCurrency(income - expense)}
          icon={<Wallet className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Transacciones"
          amount={String(transactions.length)}
          icon={<Receipt className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && <IncomeExpenseChart data={chartData} />}

      {/* Table */}
      {isLoading && transactions.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : transactions.length === 0 ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No hay transacciones en este período
          </p>
        </m.div>
      ) : (
        <TransactionsTable data={transactions} />
      )}
    </div>
  );
}
