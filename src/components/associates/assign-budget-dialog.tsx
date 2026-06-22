"use client";

import { Loader2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
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
import { useAssignBudget } from "@/hooks/mutations/use-transactions";
import { useSubordinateProfiles } from "@/hooks/queries/use-associates";
import { useProfile } from "@/hooks/queries/use-profile";
import { useUserBalance } from "@/hooks/queries/use-user-balances";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
});

interface AssignBudgetDialogProps {
  /** Preseleccionar un asociado (p. ej. desde su ficha). */
  defaultToUserId?: string;
  onSuccess?: () => void;
}

function profileLabel(p: {
  first_name: string | null;
  last_name1: string | null;
  role: string;
}) {
  const name =
    [p.first_name, p.last_name1].filter(Boolean).join(" ") || "Sin nombre";
  const roleLabel =
    p.role === "jefe_operador"
      ? "Jefe Operador"
      : p.role === "asociado"
        ? "Asociado"
        : p.role;
  return `${name} · ${roleLabel}`;
}

export function AssignBudgetDialog({
  defaultToUserId,
  onSuccess,
}: AssignBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile: me } = useProfile();
  const { profiles, isLoading: loadingProfiles } = useSubordinateProfiles(
    me?.id,
  );
  const { balance } = useUserBalance();
  const { assign, isLoading } = useAssignBudget();

  const myBalance = balance?.balance ?? 0;

  const [toUserId, setToUserId] = useState(defaultToUserId ?? "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Solo subordinados reales (excluye al propio usuario por si acaso).
  const candidates = useMemo(
    () => profiles.filter((p) => p.id !== me?.id),
    [profiles, me?.id],
  );

  function resetForm() {
    setToUserId(defaultToUserId ?? "");
    setAmount("");
    setDescription("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!me) {
      setError("Debes iniciar sesión");
      return;
    }
    if (!toUserId) {
      setError("Selecciona a quién asignarás el presupuesto");
      return;
    }
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }
    if (value > myBalance) {
      setError(
        `Saldo insuficiente. Tu saldo disponible es ${currencyFormatter.format(myBalance)}`,
      );
      return;
    }

    try {
      await assign({
        fromUserId: me.id,
        toUserId,
        amount: value,
        description: description || undefined,
      });
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al asignar presupuesto",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Asignar presupuesto
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Asignar presupuesto
          </DialogTitle>
          <DialogDescription>
            Transfiere saldo de tu cuenta a un asociado. Se descontará de tu
            saldo y se sumará al suyo de forma atómica.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between mt-1">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Tu saldo disponible
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {currencyFormatter.format(myBalance)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="assign-to">Asociado</Label>
            <select
              id="assign-to"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              disabled={loadingProfiles}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="" disabled>
                {loadingProfiles
                  ? "Cargando asociados..."
                  : candidates.length === 0
                    ? "No tienes asociados"
                    : "Selecciona un asociado"}
              </option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  {profileLabel(p)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-amount">Monto</Label>
            <Input
              id="assign-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={myBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-description">Nota (opcional)</Label>
            <Input
              id="assign-description"
              placeholder="Motivo de la asignación"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading || candidates.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar presupuesto"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
