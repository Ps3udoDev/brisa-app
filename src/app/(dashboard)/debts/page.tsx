"use client";

import { useState } from "react";
import { m } from "motion/react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useDebts, useDebtsSnowball } from "@/hooks/queries/use-debts";
import { DebtCard } from "@/components/debts/debt-card";
import { CreateDebtDialog } from "@/components/debts/create-debt-dialog";
import { StatCard } from "@/components/data-display/stat-card";
import { Loader2, CreditCard, TrendingDown, DollarSign, Snowflake } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function DebtsPage() {
  const { profile: me } = useProfile();
  const [viewMode, setViewMode] = useState<"all" | "snowball">("all");

  const { debts, isLoading: debtsLoading } = useDebts(me?.id);
  const { snowball, isLoading: snowballLoading } = useDebtsSnowball(me?.id);

  const isLoading = viewMode === "all" ? debtsLoading : snowballLoading;
  const items = viewMode === "all" ? debts : snowball;

  const totalDebt = debts.reduce((sum, d) => sum + d.current_balance, 0);
  const totalPaid = debts.reduce((sum, d) => sum + (d.total_amount - d.current_balance), 0);
  const activeDebts = debts.filter((d) => d.current_balance > 0).length;
  const paidOffDebts = debts.filter((d) => d.current_balance <= 0).length;

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
            Deudas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Controla tus obligaciones y liquídalas paso a paso
          </p>
        </div>

        <CreateDebtDialog />
      </m.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo total"
          amount={formatCurrency(totalDebt)}
          icon={<CreditCard className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Ya pagado"
          amount={formatCurrency(totalPaid)}
          icon={<TrendingDown className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Activas"
          amount={String(activeDebts)}
          icon={<DollarSign className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Liquidadas"
          amount={String(paidOffDebts)}
          icon={<Snowflake className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "all"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setViewMode("snowball")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "snowball"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          Bola de nieve
        </button>
      </div>

      {viewMode === "snowball" && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ordenadas por prioridad calculada (menor saldo / mayor impacto primero).
        </p>
      )}

      {/* List */}
      {isLoading && items.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No tienes deudas registradas</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Registra tu primera deuda con el botón de arriba
          </p>
          <div className="mt-4">
            <CreateDebtDialog />
          </div>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((debt, i) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              index={i}
              showPriority={viewMode === "snowball"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
