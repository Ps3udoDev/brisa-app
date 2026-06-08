"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useCreateTransaction } from "@/hooks/mutations/use-transactions";

const transactionTypes = [
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Gasto" },
  { value: "budget_assignment", label: "Asignación de presupuesto" },
  { value: "debt_payment", label: "Pago de deuda" },
  { value: "goal_contribution", label: "Aporte a meta" },
];

interface CreateTransactionDialogProps {
  onSuccess?: () => void;
}

export function CreateTransactionDialog({
  onSuccess,
}: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useCreateTransaction();

  const [form, setForm] = useState({
    type: "expense" as
      | "income"
      | "expense"
      | "budget_assignment"
      | "debt_payment"
      | "goal_contribution",
    amount: "",
    description: "",
    is_recurring: false,
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Debes iniciar sesión");
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }

    try {
      await create({
        type: form.type,
        amount,
        description: form.description || undefined,
        user_id: profile.id,
        creator_id: profile.id,
        status: "completed",
        is_recurring: form.is_recurring,
        is_priority: true,
      });

      setForm({
        type: "expense",
        amount: "",
        description: "",
        is_recurring: false,
      });
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error al crear la transacción");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva transacción
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Nueva transacción
          </DialogTitle>
          <DialogDescription>
            Registra un movimiento financiero en tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tx-type">Tipo</Label>
            <select
              id="tx-type"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as typeof form.type,
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {transactionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-amount">Monto</Label>
            <Input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-description">Descripción</Label>
            <Input
              id="tx-description"
              placeholder="¿En qué se gastó?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_recurring: e.target.checked }))
              }
              className="rounded border-slate-300"
            />
            Transacción recurrente
          </label>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar transacción"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
