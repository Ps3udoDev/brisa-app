"use client";

import { useState } from "react";
import { m } from "motion/react";
import { useProfile } from "@/hooks/queries/use-profile";
import {
  useBudgetRequestInbox,
  useBudgetRequestSent,
} from "@/hooks/queries/use-budget-requests";
import {
  useApproveBudgetRequest,
  useRejectBudgetRequest,
} from "@/hooks/mutations/use-budget-requests";
import { RequestCard } from "@/components/requests/request-card";
import { CreateRequestDialog } from "@/components/requests/create-request-dialog";
import { StatCard } from "@/components/data-display/stat-card";
import { Loader2, Inbox, Send, CheckCircle2, XCircle, Clock } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function RequestsPage() {
  const { profile: me } = useProfile();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");

  const {
    requests: inboxReqs,
    isLoading: inboxLoading,
    mutate: mutateInbox,
  } = useBudgetRequestInbox(me?.id);
  const {
    requests: sentReqs,
    isLoading: sentLoading,
    mutate: mutateSent,
  } = useBudgetRequestSent(me?.id);

  const { approve, isLoading: approving } = useApproveBudgetRequest();
  const { reject, isLoading: rejecting } = useRejectBudgetRequest();

  const requests = tab === "inbox" ? inboxReqs : sentReqs;
  const isLoading = tab === "inbox" ? inboxLoading : sentLoading;

  const pendingInbox = inboxReqs.filter((r) => r.status === "pending");
  const approvedInbox = inboxReqs.filter((r) => r.status === "approved");
  const rejectedInbox = inboxReqs.filter((r) => r.status === "rejected");

  async function handleApprove(id: string) {
    await approve(id);
    await mutateInbox();
    await mutateSent();
  }

  async function handleReject(id: string) {
    await reject(id);
    await mutateInbox();
    await mutateSent();
  }

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
            Solicitudes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona solicitudes de presupuesto entrantes y enviadas
          </p>
        </div>

        <CreateRequestDialog
          onSuccess={() => {
            mutateSent();
          }}
        />
      </m.div>

      {/* Stats inbox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendientes"
          amount={String(pendingInbox.length)}
          icon={<Clock className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Aprobadas"
          amount={String(approvedInbox.length)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Rechazadas"
          amount={String(rejectedInbox.length)}
          icon={<XCircle className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Total pendiente"
          amount={formatCurrency(
            pendingInbox.reduce((sum, r) => sum + r.amount, 0)
          )}
          icon={<Inbox className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("inbox")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "inbox"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Recibidas
          {pendingInbox.length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {pendingInbox.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "sent"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          <Send className="w-4 h-4" />
          Enviadas
        </button>
      </div>

      {/* List */}
      {isLoading && requests.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : requests.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            {tab === "inbox"
              ? "No tienes solicitudes recibidas"
              : "No has enviado solicitudes"}
          </p>
          {tab === "sent" && (
            <div className="mt-4">
              <CreateRequestDialog onSuccess={() => mutateSent()} />
            </div>
          )}
        </m.div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {requests.map((req, i) => (
            <RequestCard
              key={req.id}
              request={req}
              index={i}
              direction={tab}
              onApprove={tab === "inbox" ? handleApprove : undefined}
              onReject={tab === "inbox" ? handleReject : undefined}
              isProcessing={approving || rejecting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
