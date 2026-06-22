"use client";

import {
  Calendar,
  CheckCircle2,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { m } from "motion/react";
import { ContributeGoalDialog } from "@/components/goals/contribute-goal-dialog";
import type { GoalContributor } from "@/lib/services/goals.service";
import type { Goal } from "@/types/domain";

interface GoalCardProps {
  goal: Goal & {
    goal_progress?: {
      current_saved: number | null;
      target_amount: number | null;
      total_committed?: number | null;
    } | null;
    contributors?: GoalContributor[];
  };
  index?: number;
}

function contributorName(c: GoalContributor) {
  return (
    [c.profile?.first_name, c.profile?.last_name1].filter(Boolean).join(" ") ||
    "Aportante"
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha límite";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function GoalCard({ goal, index = 0 }: GoalCardProps) {
  const progress = goal.goal_progress;
  const current = progress?.current_saved ?? 0;
  const target = progress?.target_amount ?? goal.target_amount;
  const committed = progress?.total_committed ?? 0;
  const percent =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const isAchieved = percent >= 100;
  const contributors = goal.contributors ?? [];

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAchieved
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            }`}
          >
            {isAchieved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">
              {goal.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(goal.deadline)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isAchieved
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : goal.status === "cancelled"
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          }`}
        >
          {isAchieved
            ? "Alcanzada"
            : goal.status === "active"
              ? "Activa"
              : "Cancelada"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Progreso
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {percent}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
            className={`h-full rounded-full ${
              isAchieved ? "bg-emerald-500" : "bg-orange-500"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          Aportado:{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(current)}
          </span>
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          Meta:{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(target)}
          </span>
        </span>
      </div>

      {committed > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Comprometido entre aportantes: {formatCurrency(committed)}
        </p>
      )}

      {/* Aportantes + acción */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        {contributors.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {contributors.map(contributorName).join(", ")}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Sin aportantes asignados
          </span>
        )}
        {goal.status === "active" && (
          <ContributeGoalDialog goalId={goal.id} goalName={goal.name} />
        )}
      </div>
    </m.div>
  );
}
