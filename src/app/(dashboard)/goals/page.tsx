"use client";

import { useState } from "react";
import { m } from "motion/react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useGoals } from "@/hooks/queries/use-goals";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { StatCard } from "@/components/data-display/stat-card";
import { Loader2, Target, TrendingUp, CheckCircle2, TargetIcon } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const statusFilters = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "achieved", label: "Alcanzadas" },
  { value: "cancelled", label: "Canceladas" },
];

export default function GoalsPage() {
  const { profile: me } = useProfile();
  const [statusFilter, setStatusFilter] = useState("all");

  const filters =
    statusFilter === "all"
      ? { userId: me?.id }
      : { userId: me?.id, status: statusFilter };

  const { goals, isLoading } = useGoals(filters);

  const activeGoals = goals.filter((g) => g.status === "active");
  const achievedGoals = goals.filter((g) => g.status === "achieved");

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce(
    (sum, g) => sum + (g.goal_progress?.current_saved ?? 0),
    0
  );

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
            Metas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Define objetivos y mide tu progreso de ahorro
          </p>
        </div>

        <CreateGoalDialog />
      </m.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Metas activas"
          amount={String(activeGoals.length)}
          icon={<Target className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Alcanzadas"
          amount={String(achievedGoals.length)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Ahorrado total"
          amount={formatCurrency(totalSaved)}
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Meta total"
          amount={formatCurrency(totalTarget)}
          icon={<TargetIcon className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <button
            type="button"
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === filter.value
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading && goals.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : goals.length === 0 ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No tienes metas registradas</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Crea tu primera meta con el botón de arriba
          </p>
          <div className="mt-4">
            <CreateGoalDialog />
          </div>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
