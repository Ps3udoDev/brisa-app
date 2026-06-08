"use client";

import { m } from "motion/react";
import Link from "next/link";
import { useProfile } from "@/hooks/queries/use-profile";
import { useBudgetRequestInbox } from "@/hooks/queries/use-budget-requests";
import { useGoals } from "@/hooks/queries/use-goals";
import { useDebts } from "@/hooks/queries/use-debts";
import { useTransactions } from "@/hooks/queries/use-transactions";
import {
  Bell,
  Inbox,
  Target,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${days}d`;
}

interface NotificationItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  time?: string;
  href?: string;
  actionLabel?: string;
}

function NotificationItem({
  icon,
  iconBg,
  title,
  description,
  time,
  href,
  actionLabel,
}: NotificationItemProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-shadow"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
        {time && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {time}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1"
        >
          {actionLabel ?? "Ver"}
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </m.div>
  );
}

export default function NotificationsPage() {
  const { profile: me } = useProfile();

  const { requests: inbox, isLoading: inboxLoading } = useBudgetRequestInbox(
    me?.id
  );
  const { goals, isLoading: goalsLoading } = useGoals({
    creatorId: me?.id,
    status: "active",
  });
  const { debts, isLoading: debtsLoading } = useDebts(me?.id);
  const { transactions, isLoading: txLoading } = useTransactions({
    userId: me?.id,
    limit: 10,
  });

  const pendingRequests = inbox.filter((r) => r.status === "pending");
  const lowProgressGoals = goals.filter(
    (g) =>
      g.goal_progress &&
      g.target_amount > 0 &&
      (g.goal_progress.current_saved ?? 0) / g.target_amount < 0.25
  );
  const activeDebts = debts.filter((d) => d.current_balance > 0);
  const recentTx = transactions
    .filter((t) => {
      if (!t.created_at) return false;
      return Date.now() - new Date(t.created_at).getTime() < 7 * 86400000;
    })
    .slice(0, 5);

  const allNotifications = [
    ...pendingRequests.map((r) => ({
      key: `req-${r.id}`,
      icon: <Inbox className="w-5 h-5 text-amber-600" />,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      title: `Solicitud de ${r.from_user?.first_name ?? "alguien"} ${r.from_user?.last_name1 ?? ""}`,
      description: `Monto: $${r.amount.toLocaleString("es-ES")} — ${r.reason ?? "Sin descripción"}`,
      time: timeAgo(r.created_at),
      href: "/requests",
    })),
    ...lowProgressGoals.map((g) => ({
      key: `goal-${g.id}`,
      icon: <Target className="w-5 h-5 text-orange-600" />,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      title: `Meta "${g.name}"`,
      description: `Progreso bajo: ${Math.round(((g.goal_progress?.current_saved ?? 0) / g.target_amount) * 100)}% de ${g.target_amount.toLocaleString("es-ES")} USD`,
      time: undefined,
      href: "/goals",
    })),
    ...activeDebts.map((d) => ({
      key: `debt-${d.id}`,
      icon: <CreditCard className="w-5 h-5 text-red-600" />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      title: `Deuda "${d.name}" activa`,
      description: `Saldo pendiente: $${d.current_balance.toLocaleString("es-ES")} / $${d.total_amount.toLocaleString("es-ES")}`,
      time: undefined,
      href: "/debts",
    })),
    ...recentTx.map((t) => ({
      key: `tx-${t.id}`,
      icon:
        t.type === "income" || (t.type === "budget_assignment" && t.amount > 0) ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : (
          <Receipt className="w-5 h-5 text-slate-600" />
        ),
      iconBg:
        t.type === "income" || (t.type === "budget_assignment" && t.amount > 0)
          ? "bg-emerald-100 dark:bg-emerald-900/30"
          : "bg-slate-100 dark:bg-slate-800",
      title: t.type === "income" ? "Ingreso registrado" : "Gasto registrado",
      description: `${t.description ?? "Sin descripción"} — $${Math.abs(t.amount).toLocaleString("es-ES")} USD`,
      time: timeAgo(t.created_at),
      href: "/transactions",
    })),
  ];

  const isLoading = inboxLoading || goalsLoading || debtsLoading || txLoading;

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
            Resumen de actividad reciente y alertas pendientes
          </p>
        </div>
        {allNotifications.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
            <Bell className="w-4 h-4" />
            {allNotifications.length} activas
          </div>
        )}
      </m.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {pendingRequests.length}
              </p>
              <p className="text-xs text-slate-500">Solicitudes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {lowProgressGoals.length}
              </p>
              <p className="text-xs text-slate-500">Metas bajas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {activeDebts.length}
              </p>
              <p className="text-xs text-slate-500">Deudas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {recentTx.length}
              </p>
              <p className="text-xs text-slate-500">Recientes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* List */}
      {isLoading && allNotifications.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : allNotifications.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No hay notificaciones activas
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Todo está al día. Te avisaremos cuando haya novedades.
          </p>
        </m.div>
      ) : (
        <div className="space-y-3">
          {allNotifications.map((n) => (
            <NotificationItem
              key={n.key}
              icon={n.icon}
              iconBg={n.iconBg}
              title={n.title}
              description={n.description}
              time={n.time}
              href={n.href}
            />
          ))}
        </div>
      )}
    </div>
  );
}
