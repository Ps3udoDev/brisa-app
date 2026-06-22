"use client";

import {
  ArrowRight,
  Bell,
  CheckCheck,
  CheckCircle2,
  HandCoins,
  Loader2,
  PiggyBank,
  Target,
  Wallet,
  XCircle,
} from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNotifications } from "@/hooks/queries/use-notifications";
import { useProfile } from "@/hooks/queries/use-profile";
import type { Notification } from "@/lib/services/notifications.service";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  if (hrs < 24) return `hace ${hrs}h`;
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

const typeConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; label: string }
> = {
  goal_assigned: {
    icon: <Target className="w-5 h-5 text-orange-600" />,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    label: "Meta",
  },
  request_received: {
    icon: <HandCoins className="w-5 h-5 text-amber-600" />,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    label: "Solicitud",
  },
  request_approved: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    label: "Aprobada",
  },
  request_rejected: {
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    bg: "bg-red-100 dark:bg-red-900/30",
    label: "Rechazada",
  },
  debt_reminder: {
    icon: <Bell className="w-5 h-5 text-slate-600" />,
    bg: "bg-slate-100 dark:bg-slate-800",
    label: "Recordatorio",
  },
  debt_paid_off: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    label: "Deuda saldada",
  },
  budget_assigned: {
    icon: <Wallet className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    label: "Presupuesto",
  },
  goal_contribution: {
    icon: <PiggyBank className="w-5 h-5 text-orange-600" />,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    label: "Aporte",
  },
};

function NotificationItem({
  notification: n,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const config = typeConfig[n.type] || typeConfig.debt_reminder;

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border transition-all",
        n.read
          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-sm",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          config.bg,
        )}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {n.title}
          </p>
          {!n.read && (
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
          )}
        </div>
        {n.message && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {n.message}
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {timeAgo(n.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {n.link && (
          <Link
            href={n.link}
            onClick={() => !n.read && onMarkRead(n.id)}
            className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1"
          >
            Ver
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
        {!n.read && (
          <button
            type="button"
            onClick={() => onMarkRead(n.id)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Marcar como leída"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </m.div>
  );
}

export default function NotificationsPage() {
  const { profile: me } = useProfile();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications(me?.id);

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
            Notificaciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Alertas y novedades de tu red de asociados
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                Marcar todas como leídas
              </Button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
              <Bell className="w-4 h-4" />
              {unreadCount} sin leer
            </div>
          </div>
        )}
      </m.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const count = notifications.filter((n) => n.type === key).length;
          return (
            <Card
              key={key}
              className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    cfg.bg,
                  )}
                >
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {count}
                  </p>
                  <p className="text-xs text-slate-500">{cfg.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* List */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : notifications.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No hay notificaciones
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Te avisaremos cuando haya novedades.
          </p>
        </m.div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
