"use client";

import { Loader2 } from "lucide-react";
import { m } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyTrendChartProps {
  data: { month: string; total_expense: number }[];
  isLoading?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function formatMonth(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function MonthlyTrendChart({ data, isLoading }: MonthlyTrendChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-80 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
    >
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
          Gastos mensuales
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tendencia de los últimos meses
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E2875C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E2875C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="monthLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [
                formatCurrency(Number(value) || 0),
                "Gastos",
              ]}
            />
            <Area
              type="monotone"
              dataKey="total_expense"
              stroke="#E2875C"
              strokeWidth={2.5}
              fill="url(#colorExpense)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </m.div>
  );
}
