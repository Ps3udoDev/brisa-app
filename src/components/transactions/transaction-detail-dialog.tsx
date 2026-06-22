"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/hooks/mutations/use-transactions";
import type { Transaction } from "@/types/domain";

const typeLabels: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
  budget_assignment: "Asignación de presupuesto",
  debt_payment: "Pago de deuda",
  goal_contribution: "Aporte a meta",
};

// Aviso del efecto colateral al editar/borrar según el tipo compuesto.
const editHints: Record<string, string> = {
  budget_assignment: "Se ajustará el par completo: tu saldo y el del asociado.",
  debt_payment: "Se ajustará el saldo de la deuda asociada.",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TransactionDetailDialogProps {
  transaction: Transaction;
  currentUserId?: string;
  trigger: React.ReactElement;
}

export function TransactionDetailDialog({
  transaction,
  currentUserId,
  trigger,
}: TransactionDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [amount, setAmount] = useState(String(Math.abs(transaction.amount)));
  const [description, setDescription] = useState(transaction.description ?? "");
  const [error, setError] = useState("");

  const { update, isLoading: isUpdating } = useUpdateTransaction();
  const { remove, isLoading: isDeleting } = useDeleteTransaction();

  const isOwner = !!currentUserId && transaction.creator_id === currentUserId;
  const typeLabel = typeLabels[transaction.type] ?? transaction.type;
  const hint = editHints[transaction.type];
  const isNegative = transaction.amount < 0;

  function resetState() {
    setMode("view");
    setAmount(String(Math.abs(transaction.amount)));
    setDescription(transaction.description ?? "");
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }
    try {
      await update({
        id: transaction.id,
        amount: value,
        description,
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  async function handleDelete() {
    setError("");
    try {
      await remove(transaction.id);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetState();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {mode === "edit" ? "Editar transacción" : "Detalle de transacción"}
          </DialogTitle>
          <DialogDescription>{typeLabel}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mode === "edit" ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Monto</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {hint && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hint}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode("view");
                  setError("");
                }}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Monto
              </span>
              <span
                className={
                  isNegative
                    ? "text-base font-semibold text-red-600 dark:text-red-400"
                    : "text-base font-semibold text-emerald-600 dark:text-emerald-400"
                }
              >
                {isNegative ? "-" : "+"}
                {formatCurrency(Math.abs(transaction.amount))}
              </span>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">
                  Descripción
                </dt>
                <dd className="text-right text-slate-900 dark:text-white">
                  {transaction.description || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Fecha</dt>
                <dd className="text-right text-slate-900 dark:text-white">
                  {formatDateTime(
                    transaction.created_at ?? new Date().toISOString(),
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Estado</dt>
                <dd className="text-right text-slate-900 dark:text-white">
                  {transaction.status === "pending"
                    ? "Pendiente"
                    : "Completada"}
                </dd>
              </div>
              {transaction.is_recurring && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Recurrente
                  </dt>
                  <dd className="text-right text-slate-900 dark:text-white">
                    Sí
                  </dd>
                </div>
              )}
            </dl>

            {isOwner && mode === "confirm-delete" && (
              <Alert variant="destructive">
                <AlertDescription className="space-y-3">
                  <p>
                    ¿Eliminar esta transacción? El saldo
                    {hint ? " (y la deuda/par afectado)" : ""} se revertirá.
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMode("view")}
                      disabled={isDeleting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        "Sí, eliminar"
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isOwner && mode === "view" && (
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("edit")}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                  onClick={() => setMode("confirm-delete")}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            )}

            {!isOwner && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1">
                Solo quien registró la transacción puede editarla o eliminarla.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
