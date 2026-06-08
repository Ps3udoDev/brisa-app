"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Transaction } from "@/types/domain";

interface TransactionsTableProps {
  data: Transaction[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const typeLabels: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
  budget_assignment: "Asignación",
  debt_payment: "Pago deuda",
  goal_contribution: "Meta",
};

const typeColors: Record<string, string> = {
  income: "text-emerald-600 dark:text-emerald-400",
  expense: "text-red-600 dark:text-red-400",
  budget_assignment: "text-blue-600 dark:text-blue-400",
  debt_payment: "text-purple-600 dark:text-purple-400",
  goal_contribution: "text-orange-600 dark:text-orange-400",
};

export function TransactionsTable({ data }: TransactionsTableProps) {
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <span className={`text-sm font-medium ${typeColors[type] ?? "text-slate-600"}`}>
            {typeLabels[type] ?? type}
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => row.getValue("description") || "-",
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        const type = row.getValue("type") as string;
        const isNegative = type === "expense" || (type === "budget_assignment" && amount < 0);
        return (
          <span className={`font-semibold ${isNegative ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {isNegative ? "-" : "+"}
            {formatCurrency(Math.abs(amount))}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
          Detalle de transacciones
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {data.length} movimientos en el período
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
