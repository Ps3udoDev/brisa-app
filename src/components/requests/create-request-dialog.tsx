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
import { useCreateBudgetRequest } from "@/hooks/mutations/use-budget-requests";

interface CreateRequestDialogProps {
  onSuccess?: () => void;
}

export function CreateRequestDialog({ onSuccess }: CreateRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useCreateBudgetRequest();

  const [form, setForm] = useState({
    to_user_id: "",
    amount: "",
    reason: "",
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
        from_user_id: profile.id,
        to_user_id: form.to_user_id,
        amount,
        reason: form.reason || null,
        status: "pending",
      });

      setForm({ to_user_id: "", amount: "", reason: "" });
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error al enviar la solicitud");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva solicitud
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Solicitud de presupuesto</DialogTitle>
          <DialogDescription>
            Solicita fondos adicionales a tu superior.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="req-to">ID del superior</Label>
            <Input
              id="req-to"
              placeholder="UUID de tu jefe operador"
              value={form.to_user_id}
              onChange={(e) => setForm((f) => ({ ...f, to_user_id: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-amount">Monto solicitado</Label>
            <Input
              id="req-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-reason">Motivo</Label>
            <Input
              id="req-reason"
              placeholder="¿Para qué necesitas los fondos?"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
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
                Enviando...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
