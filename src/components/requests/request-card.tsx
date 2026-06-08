"use client";

import { m } from "motion/react";
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { BudgetRequest } from "@/types/domain";

interface RequestCardProps {
  request: BudgetRequest & {
    from_user?: { first_name: string | null; last_name1: string | null; role: string } | null;
    to_user?: { first_name: string | null; last_name1: string | null; role: string } | null;
  };
  index?: number;
  direction: "inbox" | "sent";
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isProcessing?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: string | null) {
  switch (status) {
    case "approved":
      return {
        label: "Aprobada",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        variant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      };
    case "rejected":
      return {
        label: "Rechazada",
        icon: <XCircle className="w-3.5 h-3.5" />,
        variant: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      };
    default:
      return {
        label: "Pendiente",
        icon: <Clock className="w-3.5 h-3.5" />,
        variant: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      };
  }
}

function displayName(user?: { first_name: string | null; last_name1: string | null } | null) {
  return [user?.first_name, user?.last_name1].filter(Boolean).join(" ") || "Usuario";
}

export function RequestCard({
  request,
  index = 0,
  direction,
  onApprove,
  onReject,
  isProcessing,
}: RequestCardProps) {
  const status = getStatusConfig(request.status);
  const isPending = request.status === "pending";

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold", direction === "inbox" ? "bg-blue-500" : "bg-orange-500")}>
            {direction === "inbox" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {direction === "inbox" ? "De:" : "Para:"}{" "}
              {displayName(direction === "inbox" ? request.from_user : request.to_user)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(request.created_at)}
            </p>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", status.variant)}>
          {status.icon}
          {status.label}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Monto solicitado</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white font-serif">
          {formatCurrency(request.amount)}
        </p>
      </div>

      {request.reason && (
        <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-3">
          {request.reason}
        </p>
      )}

      {direction === "inbox" && isPending && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => onApprove?.(request.id)}
            disabled={isProcessing}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => onReject?.(request.id)}
            disabled={isProcessing}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Rechazar
          </Button>
        </div>
      )}
    </m.div>
  );
}
