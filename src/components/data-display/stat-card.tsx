"use client";

import { m } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  amount: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function StatCard({
  title,
  amount,
  trend,
  trendLabel,
  icon,
  delay = 0,
}: StatCardProps) {
  const isPositive = trend && trend >= 0;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-[0_8px_30px_rgba(44,53,57,0.06)] transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </p>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-300">
            {icon}
          </div>
        )}
      </div>

      <p className="text-3xl font-semibold text-slate-900 dark:text-white font-serif">
        {amount}
      </p>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span className="text-sm text-slate-400 dark:text-slate-500">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </m.div>
  );
}
