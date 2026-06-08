"use client";

import { m } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface IncomeExpenseChartProps {
  data: { label: string; income: number; expense: number }[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
    >
      <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
        Ingresos vs Gastos
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Comparativa del período seleccionado
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value) || 0),
                name === "income" ? "Ingresos" : "Gastos",
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Legend
              formatter={(value) => (value === "income" ? "Ingresos" : "Gastos")}
            />
            <Bar
              dataKey="income"
              fill="#709A73"
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="expense"
              fill="#E2875C"
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </m.div>
  );
}
