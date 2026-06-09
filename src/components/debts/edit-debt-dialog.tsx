"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useUpdateDebt, usePayDebt } from "@/hooks/mutations/use-debts";
import { useDebtPayments } from "@/hooks/queries/use-debt-payments";
import type { Debt } from "@/types/domain";
import {
  Loader2,
  Pencil,
  CreditCard,
  History,
  CheckCircle2,
  Calendar,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditDebtDialogProps {
  debt: Debt;
  children?: React.ReactNode;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EditDebtDialog({ debt, children }: EditDebtDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [error, setError] = useState("");

  const { update, isLoading: updating } = useUpdateDebt();
  const { pay, isLoading: paying } = usePayDebt();
  const { payments, isLoading: paymentsLoading } = useDebtPayments(
    open ? debt.id : undefined
  );

  const isPaidOff = debt.current_balance <= 0;
  const paidAmount = debt.total_amount - debt.current_balance;
  const percent =
    debt.total_amount > 0
      ? Math.min(100, Math.round((paidAmount / debt.total_amount) * 100))
      : 0;

  // ── Formulario de edición ──
  const [editForm, setEditForm] = useState({
    name: debt.name,
    interest_rate: debt.interest_rate?.toString() ?? "",
    minimum_payment: debt.minimum_payment?.toString() ?? "",
    due_date: debt.due_date ?? "",
  });

  // ── Formulario de pago ──
  const [payForm, setPayForm] = useState({
    amount: "",
    description: "",
  });

  const handleUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        await update(debt.id, {
          name: editForm.name,
          interest_rate: editForm.interest_rate
            ? parseFloat(editForm.interest_rate)
            : null,
          minimum_payment: editForm.minimum_payment
            ? parseFloat(editForm.minimum_payment)
            : null,
          due_date: editForm.due_date || null,
        });
        setError("");
      } catch (err: any) {
        setError(err.message || "Error al actualizar la deuda");
      }
    },
    [debt.id, editForm, update]
  );

  const handlePay = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const amount = parseFloat(payForm.amount);
      if (isNaN(amount) || amount <= 0) {
        setError("El monto debe ser mayor a 0");
        return;
      }
      if (amount > debt.current_balance) {
        setError(
          `El monto no puede ser mayor al saldo pendiente (${formatCurrency(
            debt.current_balance
          )})`
        );
        return;
      }

      try {
        await pay(debt.id, amount, payForm.description);
        setPayForm({ amount: "", description: "" });
        setActiveTab("history");
        setError("");
      } catch (err: any) {
        setError(err.message || "Error al registrar el pago");
      }
    },
    [debt.id, debt.current_balance, payForm, pay]
  );

  const isLoading = updating || paying;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (children as React.ReactElement) ?? (
            <button className="absolute inset-0 cursor-pointer" aria-label="Editar deuda" />
          )
        }
      />

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            {debt.name}
          </DialogTitle>
          <DialogDescription>
            Gestiona esta deuda: edita información, registra pagos o revisa el
            historial.
          </DialogDescription>
        </DialogHeader>

        {/* Resumen rápido */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Progreso
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                isPaidOff
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-900 dark:text-white"
              )}
            >
              {percent}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isPaidOff ? "bg-emerald-500" : "bg-orange-500"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(debt.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Saldo</p>
              <p
                className={cn(
                  "font-medium",
                  isPaidOff
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatCurrency(debt.current_balance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Pagado</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(paidAmount)}
              </p>
            </div>
          </div>
          {debt.paid_off_at && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Liquidada el {formatDateTime(debt.paid_off_at)}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="pay" disabled={isPaidOff}>
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              Pagar
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-3.5 h-3.5 mr-1" />
              Pagos
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Editar ── */}
          <TabsContent value="edit" className="pt-4">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre / Descripción</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-interest">Tasa de interés (%)</Label>
                  <Input
                    id="edit-interest"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editForm.interest_rate}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        interest_rate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-min">Pago mínimo</Label>
                  <Input
                    id="edit-min"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editForm.minimum_payment}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        minimum_payment: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-due">Fecha límite</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* ── Tab: Pagar ── */}
          <TabsContent value="pay" className="pt-4">
            {isPaidOff ? (
              <div className="text-center py-8 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                <p className="font-medium">Esta deuda ya está liquidada</p>
              </div>
            ) : (
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pay-amount">
                    Monto a pagar
                    <span className="text-slate-400 dark:text-slate-500 ml-1">
                      (Saldo: {formatCurrency(debt.current_balance)})
                    </span>
                  </Label>
                  <Input
                    id="pay-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={debt.current_balance}
                    placeholder="0.00"
                    value={payForm.amount}
                    onChange={(e) =>
                      setPayForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pay-desc">Descripción (opcional)</Label>
                  <Input
                    id="pay-desc"
                    placeholder="Ej: Abono quincenal"
                    value={payForm.description}
                    onChange={(e) =>
                      setPayForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={paying}
                >
                  {paying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Registrar pago"
                  )}
                </Button>

                {parseFloat(payForm.amount) >= debt.current_balance &&
                  payForm.amount !== "" && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                      Este monto liquidará la deuda completamente
                    </p>
                  )}
              </form>
            )}
          </TabsContent>

          {/* ── Tab: Historial ── */}
          <TabsContent value="history" className="pt-4">
            <div className="space-y-3">
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay pagos registrados aún</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatCurrency(p.amount)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(p.payment_date)}
                          </p>
                        </div>
                      </div>
                      {p.transaction_id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          Tx
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
