"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { m } from "motion/react";
import { MonthlyTrendChart } from "@/components/data-display/monthly-trend-chart";
import { StatCard } from "@/components/data-display/stat-card";
import { useProfile } from "@/hooks/queries/use-profile";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useUserBalance } from "@/hooks/queries/use-user-balances";
import { useMonthlyExpenses } from "@/hooks/queries/use-views";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default function DashboardPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { transactions, isLoading: transactionsLoading } = useTransactions({
    limit: 5,
  });
  const { balance, isLoading: balanceLoading } = useUserBalance();
  const { expenses, isLoading: expensesLoading } = useMonthlyExpenses();

  const displayName =
    [profile?.first_name, profile?.last_name1].filter(Boolean).join(" ") ||
    "Usuario";

  const currentBalance = balance?.balance ?? 0;

  // Calcular ingresos y gastos del mes desde transacciones
  const currentMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.created_at ?? "");
    const now = new Date();
    return (
      tDate.getMonth() === now.getMonth() &&
      tDate.getFullYear() === now.getFullYear()
    );
  });

  const monthlyIncome = currentMonthTransactions
    .filter(
      (t) =>
        t.type === "income" || (t.type === "budget_assignment" && t.amount > 0),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter(
      (t) =>
        t.type === "expense" ||
        (t.type === "budget_assignment" && t.amount < 0),
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const isLoading = profileLoading || transactionsLoading || balanceLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">
          Hola, {displayName}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Aquí está el resumen de tu situación financiera
        </p>
      </m.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance actual"
          amount={formatCurrency(currentBalance)}
          icon={<Wallet className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Ingresos del mes"
          amount={formatCurrency(monthlyIncome)}
          trend={12}
          trendLabel="vs mes anterior"
          icon={<ArrowUpRight className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Gastos del mes"
          amount={formatCurrency(monthlyExpense)}
          trend={-5}
          trendLabel="vs mes anterior"
          icon={<ArrowDownRight className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Ahorro neto"
          amount={formatCurrency(monthlyIncome - monthlyExpense)}
          icon={<PiggyBank className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrendChart data={expenses} isLoading={expensesLoading} />
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
            Transacciones recientes
          </h3>

          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              No hay transacciones aún
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t, i) => (
                <m.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        t.amount > 0
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {t.amount > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {t.type === "budget_assignment" ? "Asignación" : t.type}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.description || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      t.amount > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {formatCurrency(t.amount)}
                  </p>
                </m.div>
              ))}
            </div>
          )}
        </m.div>
      </div>
    </div>
  );
}
