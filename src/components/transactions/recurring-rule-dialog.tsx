"use client";

import { CalendarClock, Loader2 } from "lucide-react";
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
import { useRecurringRuleMutations } from "@/hooks/mutations/use-recurring-rules";
import { useProfile } from "@/hooks/queries/use-profile";

type Frequency = "weekly" | "biweekly" | "monthly";

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Próxima ocurrencia del día del mes (este mes si aún no pasó, si no el siguiente). */
function nextMonthlyDate(dayOfMonth: number) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = now.getDate();
  const dimThis = new Date(y, m + 1, 0).getDate();
  const dayThis = Math.min(dayOfMonth, dimThis);
  if (dayThis >= today) return toYMD(new Date(y, m, dayThis));
  const dimNext = new Date(y, m + 2, 0).getDate();
  return toYMD(new Date(y, m + 1, Math.min(dayOfMonth, dimNext)));
}

interface RecurringRuleDialogProps {
  onSuccess?: () => void;
}

export function RecurringRuleDialog({ onSuccess }: RecurringRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useRecurringRuleMutations();

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    frequency: "monthly" as Frequency,
    dayOfMonth: String(new Date().getDate()),
  });
  const [error, setError] = useState("");

  function reset() {
    setForm({
      type: "expense",
      amount: "",
      description: "",
      frequency: "monthly",
      dayOfMonth: String(new Date().getDate()),
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Debes iniciar sesión");
      return;
    }

    const amount = parseFloat(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }

    const isMonthly = form.frequency === "monthly";
    const dom = Number.parseInt(form.dayOfMonth, 10);
    if (isMonthly && (Number.isNaN(dom) || dom < 1 || dom > 31)) {
      setError("El día del mes debe estar entre 1 y 31");
      return;
    }

    const nextRunDate = isMonthly ? nextMonthlyDate(dom) : toYMD(new Date());

    try {
      await create({
        user_id: profile.id,
        creator_id: profile.id,
        type: form.type,
        amount,
        description: form.description || undefined,
        frequency: form.frequency,
        day_of_month: isMonthly ? dom : null,
        next_run_date: nextRunDate,
        is_active: true,
      });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al programar el pago",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <CalendarClock className="w-4 h-4 mr-2" />
            Programar recurrente
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Pago recurrente
          </DialogTitle>
          <DialogDescription>
            Se registrará automáticamente a las 12:00 de tu zona horaria según
            la frecuencia indicada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rr-type">Tipo</Label>
              <select
                id="rr-type"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as "income" | "expense",
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rr-amount">Monto</Label>
              <Input
                id="rr-amount"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="rr-description">Descripción</Label>
            <Input
              id="rr-description"
              placeholder="Ej: Alquiler, suscripción..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rr-frequency">Frecuencia</Label>
              <select
                id="rr-frequency"
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    frequency: e.target.value as Frequency,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            {form.frequency === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="rr-dom">Día del mes</Label>
                <Input
                  id="rr-dom"
                  type="number"
                  min="1"
                  max="31"
                  value={form.dayOfMonth}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dayOfMonth: e.target.value }))
                  }
                />
              </div>
            )}
          </div>

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
              "Programar pago"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
