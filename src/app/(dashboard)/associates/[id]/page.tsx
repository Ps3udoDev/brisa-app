"use client";

import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  Receipt,
  Wallet,
} from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AssociateCard } from "@/components/associates/associate-card";
import { StatCard } from "@/components/data-display/stat-card";
import { Button } from "@/components/ui/button";
import { useAssociates } from "@/hooks/queries/use-associates";
import { useProfile } from "@/hooks/queries/use-profile";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useUserBalance } from "@/hooks/queries/use-user-balances";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  jefe_operador: "Jefe Operador",
  asociado: "Asociado",
};

const roleBadgeClass: Record<string, string> = {
  super_admin:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  jefe_operador:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  asociado: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function AssociateDetailPage() {
  const params = useParams();
  const associateId = params.id as string;

  const { profile, isLoading: profileLoading } = useProfile(associateId);
  const { balance, isLoading: balanceLoading } = useUserBalance(associateId);
  const { transactions, isLoading: transactionsLoading } = useTransactions({
    userId: associateId,
    limit: 5,
  });
  const { associates: subordinates, isLoading: subordinatesLoading } =
    useAssociates(associateId);

  const isLoading =
    profileLoading ||
    balanceLoading ||
    transactionsLoading ||
    subordinatesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">
          No se encontró el asociado
        </p>
        <Link href="/associates">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a asociados
          </Button>
        </Link>
      </div>
    );
  }

  const displayName =
    [profile.first_name, profile.last_name1].filter(Boolean).join(" ") ||
    "Sin nombre";

  const role = profile.role ?? "asociado";
  const currentBalance = balance?.balance ?? 0;

  const monthlyIncome = transactions
    .filter(
      (t) =>
        t.type === "income" || (t.type === "budget_assignment" && t.amount > 0),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter(
      (t) =>
        t.type === "expense" ||
        (t.type === "budget_assignment" && t.amount < 0),
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/associates"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a asociados
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-2xl shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">
              {displayName}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                  roleBadgeClass[role] ?? roleBadgeClass.asociado,
                )}
              >
                {roleLabels[role] ?? "Asociado"}
              </span>
              {profile.parent_id && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Vinculado
                </span>
              )}
            </div>
          </div>
        </div>
      </m.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance"
          amount={formatCurrency(currentBalance)}
          icon={<Wallet className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Ingresos recientes"
          amount={formatCurrency(monthlyIncome)}
          icon={<ArrowUpRight className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Gastos recientes"
          amount={formatCurrency(monthlyExpense)}
          icon={<ArrowDownRight className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Transacciones"
          amount={String(transactions.length)}
          icon={<Receipt className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Two columns: transactions + subordinates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
            Transacciones recientes
          </h3>

          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              No hay transacciones recientes
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t, i) => (
                <m.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
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

        {/* Subordinates */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              Subordinados
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {subordinates.length}
            </span>
          </div>

          {subordinates.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              Este asociado no tiene subordinados
            </p>
          ) : (
            <div className="space-y-3">
              {subordinates.map((s, i) => (
                <AssociateCard key={s.id} profile={s} index={i} />
              ))}
            </div>
          )}
        </m.div>
      </div>
    </div>
  );
}
