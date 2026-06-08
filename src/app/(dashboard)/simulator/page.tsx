"use client";

import { useState, useMemo } from "react";
import { m } from "motion/react";
import {
  Calculator,
  TrendingUp,
  Wallet,
  Calendar,
  Percent,
  PiggyBank,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/data-display/stat-card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function SimulatorPage() {
  const [initial, setInitial] = useState<number>(1000);
  const [monthly, setMonthly] = useState<number>(100);
  const [rate, setRate] = useState<number>(5);
  const [years, setYears] = useState<number>(10);

  const data = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const rows = [];
    let balance = initial;
    let totalContributed = initial;

    for (let month = 1; month <= n; month++) {
      balance = balance * (1 + r) + monthly;
      totalContributed += monthly;
      if (month % 12 === 0) {
        rows.push({
          year: month / 12,
          balance: Math.round(balance),
          contributed: Math.round(totalContributed),
          interest: Math.round(balance - totalContributed),
        });
      }
    }
    return rows;
  }, [initial, monthly, rate, years]);

  const final = data[data.length - 1];
  const totalInterest = final ? final.interest : 0;
  const totalContributed = final ? final.contributed : 0;
  const finalBalance = final ? final.balance : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">
          Simulador
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Calcula el crecimiento de tu ahorro con interés compuesto
        </p>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 space-y-5"
        >
          <Card className="p-5 space-y-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="w-4 h-4 text-orange-500" />
                Aporte inicial
              </Label>
              <Input
                type="number"
                min={0}
                value={initial}
                onChange={(e) => setInitial(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <PiggyBank className="w-4 h-4 text-orange-500" />
                Aporte mensual
              </Label>
              <Input
                type="number"
                min={0}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Percent className="w-4 h-4 text-orange-500" />
                Tasa anual (%)
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-orange-500" />
                Años
              </Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="h-10"
              />
            </div>
          </Card>
        </m.div>

        {/* Results */}
        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Balance final"
              amount={formatCurrency(finalBalance)}
              icon={<TrendingUp className="w-5 h-5" />}
              delay={0}
            />
            <StatCard
              title="Total aportado"
              amount={formatCurrency(totalContributed)}
              icon={<Wallet className="w-5 h-5" />}
              delay={0.1}
            />
            <StatCard
              title="Intereses ganados"
              amount={formatCurrency(totalInterest)}
              icon={<Calculator className="w-5 h-5" />}
              delay={0.2}
            />
          </div>

          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Proyección anual
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="balSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E2875C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E2875C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    formatter={(value) =>
                      [formatCurrency(Number(value) || 0)]
                    }
                    labelFormatter={(label) => `Año ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#E2875C"
                    fill="url(#balSim)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="contributed"
                    stroke="#64748b"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </m.div>
      </div>
    </div>
  );
}
