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
import { useCreateDebt } from "@/hooks/mutations/use-debts";

interface CreateDebtDialogProps {
  onSuccess?: () => void;
}

export function CreateDebtDialog({ onSuccess }: CreateDebtDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useCreateDebt();

  const [form, setForm] = useState({
    name: "",
    total_amount: "",
    current_balance: "",
    interest_rate: "",
    minimum_payment: "",
    due_date: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Debes iniciar sesión");
      return;
    }

    const total = parseFloat(form.total_amount);
    const balance = parseFloat(form.current_balance);

    if (isNaN(total) || total <= 0) {
      setError("El monto total debe ser un número positivo");
      return;
    }
    if (isNaN(balance) || balance < 0) {
      setError("El saldo actual no puede ser negativo");
      return;
    }

    try {
      await create({
        name: form.name,
        total_amount: total,
        current_balance: balance,
        user_id: profile.id,
        interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : null,
        minimum_payment: form.minimum_payment ? parseFloat(form.minimum_payment) : null,
        due_date: form.due_date || null,
      });

      setForm({
        name: "",
        total_amount: "",
        current_balance: "",
        interest_rate: "",
        minimum_payment: "",
        due_date: "",
      });
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error al registrar la deuda");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva deuda
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Nueva deuda</DialogTitle>
          <DialogDescription>
            Registra una deuda para hacer seguimiento de pagos y saldo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="debt-name">Nombre / Descripción</Label>
            <Input
              id="debt-name"
              placeholder="Ej: Tarjeta de crédito Banco X"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-total">Monto total</Label>
              <Input
                id="debt-total"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.total_amount}
                onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-balance">Saldo actual</Label>
              <Input
                id="debt-balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.current_balance}
                onChange={(e) => setForm((f) => ({ ...f, current_balance: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-interest">Tasa de interés (%)</Label>
              <Input
                id="debt-interest"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.interest_rate}
                onChange={(e) => setForm((f) => ({ ...f, interest_rate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-min">Pago mínimo</Label>
              <Input
                id="debt-min"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.minimum_payment}
                onChange={(e) => setForm((f) => ({ ...f, minimum_payment: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-due">Fecha límite</Label>
            <Input
              id="debt-due"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            />
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
              "Registrar deuda"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
